"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import SignatureCanvas from "react-signature-canvas";
import NavBar from "../navBar/nav";
import Footer from "../footer/index";
import { useRouter } from 'next/navigation';
import { useDocumentUploadMutation } from '@/redux/slices/locumProfileSlice';
import Swal from 'sweetalert2';
import { uploadService, UploadProgress as UploadProgressType, UploadResult, UploadError } from '@/services/uploadService';
import UploadProgress from '@/components/UploadProgress';
import { calculateUploadSummary, getRetryableErrors, formatFileSize } from '@/utils/uploadHelpers';

interface DocumentType {
    id: string;
    label: string;
    required: boolean;
}

interface FormValues {
    documents: {
        [key: string]: {
            checked: boolean;
            file: File | null;
        };
    };
    termsAccepted: boolean;
    privacyAccepted: boolean;
    termsSignature: string;
    privacySignature: string;
}

const documentTypes: DocumentType[] = [
    { id: 'gdcNumber', label: 'GDC Number', required: false },
    { id: 'hepatitisB', label: 'Hepatitis B', required: false },
    { id: 'dbs', label: 'DBS', required: false },
    { id: 'indemnityInsurance', label: 'Indemnity Insurance', required: false },
    { id: 'referenceLetters1', label: 'Reference Letter 1', required: false },
    { id: 'referenceLetters2', label: 'Reference Letter 2', required: false },
    { id: 'cv', label: 'CV', required: false },
    { id: 'id', label: 'ID', required: false },
    { id: 'shareCode', label: 'Share Code (Visa Status check)', required: false },
    { id: 'bankDetails', label: 'Bank Details', required: false },
    { id: 'niUtr', label: 'NI/UTR number', required: false },
];

const validationSchema = Yup.object({
    documents: Yup.object().shape(
        documentTypes.reduce((acc, doc) => {
            if (doc.required) {
                acc[doc.id] = Yup.object({
                    checked: Yup.boolean().oneOf([true], `${doc.label} must be checked`),
                    file: Yup.mixed().required(`${doc.label} file is required`),
                });
            }
            return acc;
        }, {} as any)
    ),
    termsAccepted: Yup.boolean().oneOf([true], 'You must accept the Terms and Conditions'),
    privacyAccepted: Yup.boolean().oneOf([true], 'You must accept the Privacy Policy'),
    termsSignature: Yup.string().required('Terms and Conditions signature is required'),
    privacySignature: Yup.string().required('Privacy Policy signature is required'),
});

const MyDocument = () => {
    const termsSignatureRef = useRef<SignatureCanvas>(null);
    const privacySignatureRef = useRef<SignatureCanvas>(null);
    const [termsSignatureURL, setTermsSignatureURL] = useState<string>('');
    const [privacySignatureURL, setPrivacySignatureURL] = useState<string>('');
    const router = useRouter();
    const [documentUpload, { isLoading }] = useDocumentUploadMutation();
    const [locumId, setLocumId] = useState<string>('');
    const [canvasWidth, setCanvasWidth] = useState(500);
    const containerRef = useRef<HTMLDivElement>(null);

    const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgressType>>(new Map());
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
    const [uploadErrors, setUploadErrors] = useState<UploadError[]>([]);

    const initialValues: FormValues = {
        documents: documentTypes.reduce((acc, doc) => {
            acc[doc.id] = { checked: false, file: null };
            return acc;
        }, {} as any),
        termsAccepted: false,
        privacyAccepted: false,
        termsSignature: '',
        privacySignature: '',
    };

    const handleFileChange = (
        docId: string,
        file: File | null,
        setFieldValue: any
    ) => {
        setFieldValue(`documents.${docId}.file`, file);
        if (file) {
            setFieldValue(`documents.${docId}.checked`, true);
        }
    };

    const handleSignature = (
        canvasRef: React.RefObject<SignatureCanvas | null>,
        setSignatureURL: React.Dispatch<React.SetStateAction<string>>,
        fieldName: string,
        setFieldValue: any
    ) => {
        if (!canvasRef.current || canvasRef.current.isEmpty()) {
            Swal.fire({
                icon: 'warning',
                title: 'Oops!',
                text: 'Please draw your signature first.',
                confirmButtonColor: '#3085d6',
            });
            return;
        }
        const dataURL = canvasRef.current.getCanvas().toDataURL("image/png");
        if (dataURL) {
            setSignatureURL(dataURL);
            setFieldValue(fieldName, dataURL);
        }
    };

    const clearSignature = (
        canvasRef: React.RefObject<SignatureCanvas | null>,
        setSignatureURL: React.Dispatch<React.SetStateAction<string>>,
        fieldName: string,
        setFieldValue: any
    ) => {
        if (canvasRef.current) {
            canvasRef.current.clear();
        }
        setSignatureURL('');
        setFieldValue(fieldName, '');
    };

    const onSubmit = async (values: FormValues, { resetForm }: { resetForm: () => void }) => {
        if (isUploading) return;

        setIsUploading(true);
        setUploadResults([]);
        setUploadErrors([]);
        setUploadProgress(new Map());

        const documents = values.documents;
        const fieldMap: Record<string, string> = {
            gdcNumber: 'gdcImage',
            indemnityInsurance: 'indemnityInsuranceImage',
            hepatitisB: 'hepatitisBImage',
            dbs: 'dbsImage',
            referenceLetters1: 'referenceletter1',
            referenceLetters2: 'referenceletter2',
            cv: 'cv',
            id: 'idImage',
            bankDetails: 'bankDetails',
            shareCode: 'shareCode',
            niUtr: 'NIUTRnumber'
        };

        const filesToUpload = Object.entries(documents)
            .filter(([key, value]) => value.file && fieldMap[key])
            .map(([key, value]) => ({
                file: value.file!,
                fileId: `${key}_${Date.now()}`,
                fieldName: fieldMap[key]
            }));

        if (filesToUpload.length === 0) {
            Swal.fire({
                title: 'No files to upload!',
                text: 'Please select at least one document to upload.',
                icon: 'warning',
                confirmButtonText: 'OK',
            });
            setIsUploading(false);
            return;
        }

        try {
            const results = await uploadService.uploadFiles(filesToUpload, locumId, {
                maxRetries: 3,
                retryDelay: 2000,
                timeout: 60000,
                onProgress: (progress) => {
                    setUploadProgress(prev => new Map(prev.set(progress.fileId, progress)));
                },
                onComplete: (result) => {
                    setUploadResults(prev => [...prev, result]);
                },
                onError: (error) => {
                    setUploadErrors(prev => [...prev, error]);
                }
            });

            const summary = calculateUploadSummary(results, uploadErrors);
            const retryableErrors = getRetryableErrors(uploadErrors);

            if (summary.failedUploads === 0) {
                Swal.fire({
                    title: 'All documents uploaded successfully!',
                    text: `${summary.successfulUploads} file(s) uploaded successfully.`,
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
                resetForm();
            } else if (summary.successfulUploads > 0) {
                const retryMessage = retryableErrors.length > 0
                    ? `\n\n${retryableErrors.length} failed upload(s) can be retried.`
                    : '';

                Swal.fire({
                    title: 'Partial upload completed',
                    text: `${summary.successfulUploads} file(s) uploaded successfully, ${summary.failedUploads} failed.${retryMessage}`,
                    icon: 'warning',
                    confirmButtonText: 'OK',
                });
            } else {
                const retryMessage = retryableErrors.length > 0
                    ? '\n\nSome uploads can be retried. Please check the upload results below.'
                    : '\n\nPlease check your connection and try again.';

                Swal.fire({
                    title: 'Upload failed!',
                    text: `All ${summary.totalFiles} file(s) failed to upload.${retryMessage}`,
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }

        } catch (error) {
            console.error('Upload error:', error);
            Swal.fire({
                title: 'Upload failed!',
                text: 'An unexpected error occurred. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancelUpload = (fileId: string) => {
        uploadService.cancelUpload(fileId);
        setUploadProgress(prev => {
            const newMap = new Map(prev);
            newMap.delete(fileId);
            return newMap;
        });
    };

    const handleRetryUpload = async (fileId: string) => {
        const error = uploadErrors.find(e => e.fileId === fileId);
        if (!error) return;

        setUploadErrors(prev => prev.filter(e => e.fileId !== fileId));

        console.log('Retrying upload for:', fileId);

        Swal.fire({
            title: 'Retry Not Available',
            text: 'To retry this upload, please select the file again and submit the form.',
            icon: 'info',
            confirmButtonText: 'OK',
        });
    };

    const handleRetryAllFailed = async () => {
        const retryableErrors = getRetryableErrors(uploadErrors);

        if (retryableErrors.length === 0) {
            Swal.fire({
                title: 'No Retryable Uploads',
                text: 'None of the failed uploads can be retried automatically.',
                icon: 'info',
                confirmButtonText: 'OK',
            });
            return;
        }

        Swal.fire({
            title: 'Retry Failed Uploads',
            text: `Retry ${retryableErrors.length} failed upload(s)?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Retry',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                setUploadErrors([]);
                Swal.fire({
                    title: 'Please Resubmit',
                    text: 'To retry failed uploads, please select the files again and submit the form.',
                    icon: 'info',
                    confirmButtonText: 'OK',
                });
            }
        });
    };

    useEffect(() => {
        const storedId = localStorage.getItem('locumId');
        if (storedId) {
            const cleanId = storedId.replace(/"/g, '');
            console.log("Clean Locum ID:", cleanId);

            const parts = cleanId.match(/.{1,4}/g);
            console.log("Split Parts:", parts);

            setLocumId(cleanId);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setCanvasWidth(containerRef.current.offsetWidth);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <NavBar />
            <main className="min-h-screen bg-white pt-32">
                <section className="py-16 lg:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-12 lg:mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                                Document Upload
                            </h2>
                            <p className="text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto">
                                Please upload all required documents to complete your profile.
                            </p>
                        </div>

                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={onSubmit}
                        >
                            {({ values, setFieldValue, errors, touched, resetForm }) => (
                                <Form className="max-w-4xl mx-auto">
                                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 mb-8">
                                        <h3 className="text-2xl font-bold text-black mb-6">Required Documents</h3>

                                        <div className="grid gap-6">
                                            {documentTypes.map((doc) => (
                                                <div key={doc.id} className="border border-gray-200 rounded-lg p-6" style={{ backgroundColor: '#C3EAE7' }}>
                                                    <div className="flex items-start space-x-4">
                                                        <Field
                                                            type="checkbox"
                                                            name={`documents.${doc.id}.checked`}
                                                            className="mt-1 h-5 w-5 text-black focus:ring-black border-gray-300 rounded"
                                                        />
                                                        <div className="flex-1">
                                                            <label className="text-lg font-semibold text-black mb-2 block">
                                                                {doc.label}
                                                                {doc.required && <span className="text-red-500 ml-1">*</span>}
                                                            </label>

                                                            {values.documents[doc.id]?.checked && (
                                                                <div className="mt-4">
                                                                    <input
                                                                        type="file"
                                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0] || null;
                                                                            handleFileChange(doc.id, file, setFieldValue);
                                                                        }}
                                                                        className="block w-full text-sm text-gray-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-lg file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-black file:text-white
                                      hover:file:bg-gray-800
                                      file:cursor-pointer cursor-pointer"
                                                                    />
                                                                    <p className="text-sm text-gray-600 mt-2">
                                                                        Supported formats: PDF, JPG, JPEG, PNG
                                                                    </p>
                                                                    {values.documents[doc.id]?.file && (
                                                                        <p className="text-sm text-green-600 mt-2">
                                                                            ✓ File selected: {values.documents[doc.id].file?.name}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <ErrorMessage
                                                                name={`documents.${doc.id}.checked`}
                                                                component="div"
                                                                className="text-red-500 text-sm mt-1"
                                                            />
                                                            <ErrorMessage
                                                                name={`documents.${doc.id}.file`}
                                                                component="div"
                                                                className="text-red-500 text-sm mt-1"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 mb-8">
                                        <h3 className="text-2xl font-bold text-black mb-6">Terms and Conditions</h3>

                                        <div className="mb-6">
                                            <div className="flex items-start space-x-3 mb-4">
                                                <Field
                                                    type="checkbox"
                                                    name="termsAccepted"
                                                    className="mt-1 h-5 w-5 text-black focus:ring-black border-gray-300 rounded"
                                                />
                                                <label className="text-lg text-black">
                                                    I have read and agree to the Terms and Conditions
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                            </div>
                                            <div className="mb-4">
                                                <a
                                                    href="/components/termsandconditions"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 underline text-base font-medium cursor-pointer"
                                                >
                                                    Read Full Terms and Conditions
                                                </a>
                                            </div>
                                            <ErrorMessage
                                                name="termsAccepted"
                                                component="div"
                                                className="text-red-500 text-sm"
                                            />
                                        </div>

                                        {values.termsAccepted && (
                                            <div className="border-2 border-gray-300 rounded-lg p-6" style={{ backgroundColor: '#C3EAE7' }}>
                                                <h4 className="text-lg font-semibold text-black mb-4">
                                                    Please sign to confirm your agreement:
                                                </h4>

                                                <div className="bg-white p-4 rounded-lg items-center justify-center">
                                                    <div ref={containerRef} className="w-full max-w-md mx-auto">
                                                        <SignatureCanvas
                                                            ref={termsSignatureRef}
                                                            penColor="black"
                                                            canvasProps={{
                                                                width: canvasWidth,
                                                                height: 200,
                                                                className: "border border-gray-400 rounded-lg bg-white w-full h-48",
                                                                style: { width: "100%", height: "200px" }
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="flex gap-4 mt-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSignature(termsSignatureRef, setTermsSignatureURL, 'termsSignature', setFieldValue)}
                                                            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                                                        >
                                                            Save Signature
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => clearSignature(termsSignatureRef, setTermsSignatureURL, 'termsSignature', setFieldValue)}
                                                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                                                        >
                                                            Clear
                                                        </button>
                                                    </div>

                                                    {termsSignatureURL && (
                                                        <div className="mt-4">
                                                            <p className="text-green-600 text-sm">✓ Terms and Conditions signature saved</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <ErrorMessage
                                                    name="termsSignature"
                                                    component="div"
                                                    className="text-red-500 text-sm mt-2"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 mb-8">
                                        <h3 className="text-2xl font-bold text-black mb-6">Privacy Policy</h3>

                                        <div className="mb-6">
                                            <div className="flex items-start space-x-3 mb-4">
                                                <Field
                                                    type="checkbox"
                                                    name="privacyAccepted"
                                                    className="mt-1 h-5 w-5 text-black focus:ring-black border-gray-300 rounded"
                                                />
                                                <label className="text-lg text-black">
                                                    I have read and agree to the Privacy Policy
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                            </div>
                                            <ErrorMessage
                                                name="privacyAccepted"
                                                component="div"
                                                className="text-red-500 text-sm"
                                            />
                                        </div>

                                        {values.privacyAccepted && (
                                            <div className="border-2 border-gray-300 rounded-lg p-6" style={{ backgroundColor: '#C3EAE7' }}>
                                                <h4 className="text-lg font-semibold text-black mb-4">
                                                    Please sign to confirm your agreement:
                                                </h4>

                                                <div className="bg-white p-4 rounded-lg">
                                                    <div className="w-full max-w-md mx-auto">
                                                        <SignatureCanvas
                                                            ref={privacySignatureRef}
                                                            penColor="black"
                                                            canvasProps={{
                                                                width: canvasWidth,
                                                                height: 200,
                                                                className: "border border-gray-400 rounded-lg bg-white w-full h-48",
                                                                style: { width: "100%", height: "200px" }
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="flex gap-4 mt-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSignature(privacySignatureRef, setPrivacySignatureURL, 'privacySignature', setFieldValue)}
                                                            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                                                        >
                                                            Save Signature
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => clearSignature(privacySignatureRef, setPrivacySignatureURL, 'privacySignature', setFieldValue)}
                                                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                                                        >
                                                            Clear
                                                        </button>
                                                    </div>

                                                    {privacySignatureURL && (
                                                        <div className="mt-4">
                                                            <p className="text-green-600 text-sm">✓ Privacy Policy signature saved</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <ErrorMessage
                                                    name="privacySignature"
                                                    component="div"
                                                    className="text-red-500 text-sm mt-2"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {isUploading && (
                                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
                                            <h3 className="text-xl font-bold text-black mb-4">Uploading Documents...</h3>
                                            <div className="space-y-4">
                                                {Array.from(uploadProgress.values()).map((progress) => (
                                                    <UploadProgress
                                                        key={progress.fileId}
                                                        progress={progress}
                                                        onCancel={() => handleCancelUpload(progress.fileId)}
                                                        onRetry={() => handleRetryUpload(progress.fileId)}
                                                    />
                                                ))}
                                            </div>

                                            {uploadProgress.size === 0 && (
                                                <div className="text-center py-4">
                                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                    <p className="text-gray-600 mt-2">Preparing uploads...</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {(uploadResults.length > 0 || uploadErrors.length > 0) && !isUploading && (
                                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl font-bold text-black">Upload Results</h3>
                                                {getRetryableErrors(uploadErrors).length > 0 && (
                                                    <button
                                                        onClick={handleRetryAllFailed}
                                                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                                                    >
                                                        Retry Failed ({getRetryableErrors(uploadErrors).length})
                                                    </button>
                                                )}
                                            </div>

                                            {uploadResults.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="text-green-600 font-semibold mb-2">
                                                        ✅ Successfully Uploaded ({uploadResults.length})
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {uploadResults.map((result) => (
                                                            <div key={result.fileId} className="text-sm text-green-700 bg-green-50 p-3 rounded border border-green-200 flex items-center justify-between">
                                                                <div>
                                                                    <div className="font-medium">{result.fileName}</div>
                                                                    {result.retryCount > 0 && (
                                                                        <div className="text-xs text-green-600">
                                                                            Retried {result.retryCount} time(s)
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="text-green-500">✓</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {uploadErrors.length > 0 && (
                                                <div>
                                                    <h4 className="text-red-600 font-semibold mb-2">
                                                        ❌ Failed Uploads ({uploadErrors.length})
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {uploadErrors.map((error) => (
                                                            <div key={error.fileId} className="text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <div className="font-medium">{error.fileName}</div>
                                                                        <div className="text-xs text-red-600 mt-1">{error.error}</div>
                                                                        {error.retryCount > 0 && (
                                                                            <div className="text-xs text-red-500 mt-1">
                                                                                Retried {error.retryCount} time(s)
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {error.willRetry && (
                                                                        <button
                                                                            onClick={() => handleRetryUpload(error.fileId)}
                                                                            className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
                                                                        >
                                                                            Retry
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="text-center">
                                        <button
                                            type="submit"
                                            disabled={isUploading}
                                            className={`px-8 py-4 rounded-lg text-lg font-semibold transition-colors ${isUploading
                                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                : 'bg-black text-white hover:bg-gray-800'
                                                }`}
                                        >
                                            {isUploading ? 'Uploading...' : 'Submit All Documents'}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </section>
                <Footer />
            </main>
        </>
    );
}

export default MyDocument;