"use client";
import React, { useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import SignatureCanvas from "react-signature-canvas";
import NavBar from "../navBar/nav";
import Footer from "../footer/index";

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
    { id: 'gdcNumber', label: 'GDC Number', required: true },
    { id: 'hepatitisB', label: 'Hepatitis B', required: true },
    { id: 'dbs', label: 'DBS', required: true },
    { id: 'indemnityInsurance', label: 'Indemnity Insurance', required: true },
    { id: 'referenceLetters1', label: 'Reference Letter 1', required: true },
    { id: 'referenceLetters2', label: 'Reference Letter 2', required: true },
    { id: 'cv', label: 'CV', required: true },
    { id: 'id', label: 'ID', required: true },
    { id: 'shareCode', label: 'Share Code (Visa Status check)', required: true },
    { id: 'bankDetails', label: 'Bank Details', required: true },
    { id: 'niUtr', label: 'NI/UTR number', required: true },
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
            alert("Please draw your signature first.");
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

    const onSubmit = (values: FormValues) => {
        console.log('Form submitted:', values);
        alert('Documents uploaded successfully!');
    };

    return (
        <>
            <NavBar />

            <main className="min-h-screen bg-white">
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
                            {({ values, setFieldValue, errors, touched }) => (
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
                                                    <SignatureCanvas
                                                        ref={termsSignatureRef}
                                                        penColor="black"
                                                        canvasProps={{
                                                            width: 500,
                                                            height: 200,
                                                            className: "border border-gray-400 rounded-lg bg-white items-center justify-center",
                                                        }}
                                                    />

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
                                                    <SignatureCanvas
                                                        ref={privacySignatureRef}
                                                        penColor="black"
                                                        canvasProps={{
                                                            width: 500,
                                                            height: 200,
                                                            className: "border border-gray-400 rounded-lg bg-white",
                                                        }}
                                                    />

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

                                    <div className="text-center">
                                        <button
                                            type="submit"
                                            className="bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors"
                                        >
                                            Submit All Documents
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