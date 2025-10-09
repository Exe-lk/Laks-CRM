import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { FiX, FiMapPin, FiPhone, FiMail, FiHome, FiLock } from 'react-icons/fi';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { GoogleMapModal } from '../../../components/GoogleMapModal';
import { Branch, CreateBranchData, UpdateBranchData } from '../../../redux/slices/branchPracticeSlice';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBranchData | UpdateBranchData) => Promise<void>;
  branch?: Branch | null;
  practiceId: string;
  loading: boolean;
}

interface FormValues {
  name: string;
  address: string;
  location: string;
  telephone: string;
  email: string;
  password: string;
}

const validateBranchForm = (values: FormValues, isEditing: boolean = false) => {
  const errors: Partial<FormValues> = {};

  if (!values.name?.trim()) {
    errors.name = 'Branch name is required';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Branch name must be at least 2 characters long';
  } else if (values.name.trim().length > 100) {
    errors.name = 'Branch name must be less than 100 characters';
  }

  if (!values.address?.trim()) {
    errors.address = 'Address is required';
  } else if (values.address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters long';
  } else if (values.address.trim().length > 200) {
    errors.address = 'Address must be less than 200 characters';
  }

  if (!values.location?.trim()) {
    errors.location = 'Coordinates are required';
  } else {
    const coordRegex = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    if (!coordRegex.test(values.location.trim())) {
      errors.location = 'Invalid coordinates format. Use longitude,latitude (e.g., -0.1278,51.5074)';
    }
  }

  if (values.telephone && values.telephone.trim()) {
    if (!/^\d{10}$/.test(values.telephone.replace(/[\s\-\(\)]/g, ''))) {
      errors.telephone = 'Contact number must be exactly 10 digits (after +44)';
    }
  }

  if (!values.email?.trim()) {
    errors.email = 'Email address is required';
  } else {
    const email = values.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Invalid email format. Please enter a valid email address.';
    } else if (email.length > 254) {
      errors.email = 'Email address is too long (maximum 254 characters).';
    } else if (email.includes('..')) {
      errors.email = 'Email address cannot contain consecutive dots.';
    }
  }

  if (!isEditing && !values.password?.trim()) {
    errors.password = 'Password is required';
  } else if (values.password?.trim()) {
    if (values.password.trim().length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (values.password.trim().length > 50) {
      errors.password = 'Password must be less than 50 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(values.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
  }

  return errors;
};

const BranchModal: React.FC<BranchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  branch,
  practiceId,
  loading
}) => {
  const isEditing = !!branch;
  const [showMap, setShowMap] = useState(false);

  const formik = useFormik<FormValues>({
    initialValues: {
      name: '',
      address: '',
      location: '',
      telephone: '',
      email: '',
      password: '',
    },
    validate: (values) => validateBranchForm(values, isEditing),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const baseData = {
          name: values.name.trim(),
          address: values.address.trim(),
          location: values.location.trim(),
          telephone: values.telephone.trim() || undefined,
          email: values.email.trim(),
        };

        const branchData = isEditing
          ? ({
            ...baseData,
            id: branch!.id,
            ...(values.password.trim() && { password: values.password.trim() }),
          } as UpdateBranchData)
          : ({
            ...baseData,
            password: values.password.trim(), // Password is required for creation
            practiceId,
          } as CreateBranchData);

        console.log('Submitting branch data:', {
          ...branchData,
          email: `"${branchData.email}"`, 
          password: '[REDACTED]'
        });
        await onSubmit(branchData);
        formik.resetForm();
        onClose();
      } catch (error) {
      }
    }
  });

  useEffect(() => {
    if (branch && isOpen) {
      formik.setValues({
        name: branch.name,
        address: branch.address,
        location: branch.location,
        telephone: branch.telephone || '',
        email: branch.email || '',
        password: '',
      });
    } else if (!branch && isOpen) {
      formik.resetForm();
    }
  }, [branch, isOpen]);

  const handleMapSelect = (location: { lat: number; lng: number; address: string }) => {
    formik.setFieldValue('address', location.address);
    formik.setFieldValue('location', `${location.lng},${location.lat}`);
    setShowMap(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#C3EAE7] rounded-full flex items-center justify-center">
                <FiHome className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? 'Edit Branch' : 'Create New Branch'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isEditing ? 'Update branch information' : 'Add a new branch to your practice'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={loading}
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiHome className="w-4 h-4 text-[#C3EAE7]" />
                Branch Name *
              </label>
              <input
                type="text"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter branch name"
                className={`w-full px-4 py-3 border-2 rounded-xl 
                  focus:ring-2 focus:ring-[#C3EAE7]/30 
                  transition-all duration-200 outline-none 
                  hover:border-[#C3EAE7]/50
                  ${formik.touched.name && formik.errors.name
                    ? 'border-red-300 focus:border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-[#C3EAE7]'
                  }`}
                required
              />
              {formik.touched.name && formik.errors.name && (
                <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{formik.errors.name}</p>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-[#C3EAE7]" />
                Address *
              </label>
              <div className="relative">
                <textarea
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter full address or click the map icon to select location"
                  rows={3}
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl 
                    focus:ring-2 focus:ring-[#C3EAE7]/30 
                    transition-all duration-200 outline-none 
                    hover:border-[#C3EAE7]/50 resize-none
                    ${formik.touched.address && formik.errors.address
                      ? 'border-red-300 focus:border-red-400 bg-red-50'
                      : 'border-gray-200 focus:border-[#C3EAE7]'
                    }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="absolute right-3 top-3 p-2 bg-[#C3EAE7] hover:bg-[#A9DBD9] rounded-lg transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  title="Select location on map"
                >
                  <FaMapMarkerAlt style={{ color: 'black' }} />
                </button>
              </div>
              {formik.touched.address && formik.errors.address && (
                <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{formik.errors.address}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-[#C3EAE7]" />
                Coordinates *
              </label>
              <input
                type="text"
                name="location"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Longitude, Latitude (auto-filled from map)"
                className={`w-full px-4 py-3 border-2 rounded-xl 
                  focus:ring-2 focus:ring-[#C3EAE7]/30 
                  transition-all duration-200 outline-none 
                  hover:border-[#C3EAE7]/50
                  ${formik.touched.location && formik.errors.location
                    ? 'border-red-300 focus:border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-[#C3EAE7]'
                  }`}
                required
                readOnly
              />
              <p className="text-xs text-gray-500">
                Coordinates are automatically set when you select a location on the map
              </p>
              {formik.touched.location && formik.errors.location && (
                <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{formik.errors.location}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiPhone className="w-4 h-4 text-[#C3EAE7]" />
                Phone Number
              </label>
              <input
                type="tel"
                name="telephone"
                value={formik.values.telephone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter phone number"
                className={`w-full px-4 py-3 border-2 rounded-xl 
                  focus:ring-2 focus:ring-[#C3EAE7]/30 
                  transition-all duration-200 outline-none 
                  hover:border-[#C3EAE7]/50
                  ${formik.touched.telephone && formik.errors.telephone
                    ? 'border-red-300 focus:border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-[#C3EAE7]'
                  }`}
              />
              {formik.touched.telephone && formik.errors.telephone && (
                <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{formik.errors.telephone}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiMail className="w-4 h-4 text-[#C3EAE7]" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter email address"
                className={`w-full px-4 py-3 border-2 rounded-xl 
                  focus:ring-2 focus:ring-[#C3EAE7]/30 
                  transition-all duration-200 outline-none 
                  hover:border-[#C3EAE7]/50
                  ${formik.touched.email && formik.errors.email
                    ? 'border-red-300 focus:border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-[#C3EAE7]'
                  }`}
                required
              />
              {formik.touched.email && formik.errors.email && (
                <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{formik.errors.email}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiLock className="w-4 h-4 text-[#C3EAE7]" />
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={isEditing ? "Enter new password (leave empty to keep current password)" : "Enter password"}
                className={`w-full px-4 py-3 border-2 rounded-xl 
                  focus:ring-2 focus:ring-[#C3EAE7]/30 
                  transition-all duration-200 outline-none 
                  hover:border-[#C3EAE7]/50
                  ${formik.touched.password && formik.errors.password
                    ? 'border-red-300 focus:border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-[#C3EAE7]'
                  }`}
                required={!isEditing}
              />
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
              {formik.touched.password && formik.errors.password && (
                <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{formik.errors.password}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl 
                hover:bg-gray-300 transition-all duration-200 font-medium
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formik.isValid}
              className="px-6 py-3 bg-[#C3EAE7] text-black rounded-xl 
                hover:bg-[#A9DBD9] transition-all duration-200 font-bold
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              )}
              {isEditing ? 'Update Branch' : 'Create Branch'}
            </button>
          </div>
        </form>
      </div>

      <GoogleMapModal
        open={showMap}
        onClose={() => setShowMap(false)}
        onSelect={handleMapSelect}
      />
    </div>
  );
};

export default BranchModal;
