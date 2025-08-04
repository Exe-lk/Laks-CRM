import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUpdatePracticeProfileMutation } from '../../../redux/slices/practiceProfileSlice';
import { FaUserMd, FaEnvelope, FaIdBadge, FaPhone, FaBirthdayCake, FaUserShield, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaBriefcase, FaSignOutAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

interface Profile {
  name?: string;
  email?: string;
  telephone?: string;
  address?: string;
  location?: string;
  GDCnumber?: string;
  dob?: string;
  status?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState<Profile | null>(null);
  const router = useRouter();
  const [addLocumProfile, { isLoading: isAdding }] = useUpdatePracticeProfileMutation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      try {
        setProfile(JSON.parse(profileStr));
      } catch {
        setProfile(null);
      }
    }
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure you want to logout?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      confirmButtonText: 'OK',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#3085d6',
      confirmButtonColor: '#d33',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('profile');
        setIsLoggedIn(false);

        Swal.fire({
          title: 'Logged out',
          text: 'You have been successfully logged out.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          onClose();
          router.push('/');
        });
      }
    });
  };

  const handleEdit = () => {
    setEditProfile(profile);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditProfile(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editProfile) return;
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!editProfile) return;
    try {
      await addLocumProfile(editProfile as any).unwrap();
      setProfile(editProfile);
      localStorage.setItem('profile', JSON.stringify(editProfile));
      setEditMode(false);
      setEditProfile(null);
    } catch (error) {
      // alert('Failed to update profile');
      Swal.fire({
        icon: 'error',
        title: 'Failed to update profile',
        text: 'Please try again later.',
        confirmButtonColor: '#d33',
      });
      
    }
  };

  if (!isOpen) return null;

  if (!profile) {
    return null;
  }

  const renderEditField = (label: string, name: keyof Profile, icon: React.ReactNode, type: string = 'text', disabled: boolean = false) => (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center pt-4">
      <div className="flex items-center gap-2">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <div className="col-span-2">
        <input
          className="border rounded px-3 py-2 mt-1 text-black w-full"
          name={name}
          value={editProfile?.[name] || ''}
          onChange={handleChange}
          type={type}
          disabled={disabled}
        />
      </div>
    </div>
  );

  const renderViewField = (label: string, value: string | undefined, icon: React.ReactNode, extra?: React.ReactNode) => (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center pt-4">
      <div className="flex items-center gap-2">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <div className="col-span-2 text-gray-800 break-all">{value || '-'}{extra}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-white/30">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-0 relative">
        <div className="flex items-center justify-between px-8 pt-6 pb-2 border-b">
          <h2 className="text-2xl font-bold text-primary-800">User Details</h2>
          <div className="flex items-center gap-4">
            {!editMode && (
              <button
                className="bg-[#C3EAE7] text-black px-4 py-1 rounded-full font-medium hover:bg-[#A9DBD9] transition shadow text-base"
                onClick={handleEdit}
              >
                Edit
              </button>
            )}
            <button
              className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-10">
          <div className="flex flex-col gap-4 divide-y divide-gray-200">
            {editMode ? (
              <>
                {renderEditField('Full Name', 'name', <FaUserMd className="text-primary-700" />)}
                {renderEditField('Email', 'email', <FaEnvelope className="text-primary-700" />, 'text', true)}
                {renderEditField('GDC Number', 'GDCnumber', <FaIdBadge className="text-primary-700" />)}
                {renderEditField('Contact', 'telephone', <FaPhone className="text-primary-700" />)}
                {renderEditField('Address', 'address', <FaMapMarkerAlt className="text-primary-700" />)}
                {renderEditField('Status', 'status', profile.status === 'Active' ? <FaCheckCircle className="text-green-600" /> : <FaTimesCircle className="text-red-600" />, 'text', true)}
              </>
            ) : (
              <>
                {renderViewField('Full Name', profile.name, <FaUserMd className="text-primary-700" />)}
                {renderViewField('Email', profile.email, <FaEnvelope className="text-primary-700" />)}
                {renderViewField('GDC Number', profile.GDCnumber, <FaIdBadge className="text-primary-700" />)}
                {renderViewField('Contact', profile.telephone, <FaPhone className="text-primary-700" />)}
                {renderViewField('Address', profile.address, <FaMapMarkerAlt className="text-primary-700" />)}
                {renderViewField(
                  'Status',
                  undefined, 
                  profile.status === 'Active'
                    ? <FaCheckCircle className="text-green-600" />
                    : <FaTimesCircle className="text-red-600" />,
                  (
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide ${profile.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {profile.status}
                    </span>
                  )
                )}
              </>
            )}
          </div>
          <div className="mt-10 flex justify-center gap-4">
            {editMode ? (
              <>
                <button
                  className="bg-[#C3EAE7] text-black px-6 py-2 rounded-full font-medium hover:bg-[#A9DBD9] transition shadow"
                  onClick={handleSave}
                  disabled={isAdding}
                >
                  {isAdding ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="bg-gray-300 text-black px-6 py-2 rounded-full font-medium hover:bg-gray-400 transition shadow"
                  onClick={handleCancel}
                  disabled={isAdding}
                >
                  Cancel
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal; 