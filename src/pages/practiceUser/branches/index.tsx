import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiHome } from 'react-icons/fi';
import Swal from 'sweetalert2';
import NavBarPracticeUser from '../../components/navBarPracticeUser';
import Footer from '../../components/footer';
import BranchesTable from '../../components/branchesTable';
import BranchModal from '../../components/branchModal';
import { 
  fetchBranches, 
  createBranch, 
  updateBranch, 
  Branch, 
  CreateBranchData, 
  UpdateBranchData 
} from '../../../redux/slices/branchPracticeSlice';
import { RootState, AppDispatch } from '../../../redux/store';

interface Profile {
  id: string;
  name: string;
  email: string;
  practiceType?: string;
  [key: string]: any;
}

const BranchesPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { branches, loading, error } = useSelector((state: RootState) => state.branches);
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/practiceUser/practiceLogin');
      return;
    }

    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      try {
        const parsedProfile = JSON.parse(profileStr);
        setProfile(parsedProfile);
        
        if (parsedProfile.practiceType !== 'Corporate') {
          Swal.fire({
            icon: 'warning',
            title: 'Access Restricted',
            text: 'Branch management is only available for Corporate practices. Private practices operate as a single location.',
            confirmButtonColor: '#C3EAE7',
          }).then(() => {
            router.push('/practiceUser/dashboard');
          });
          return;
        }
        
        if (parsedProfile.id) {
          dispatch(fetchBranches(parsedProfile.id));
        }
      } catch (error) {
        console.error('Error parsing profile:', error);
        router.push('/practiceUser/practiceLogin');
        return;
      }
    } else {
      router.push('/practiceUser/practiceLogin');
      return;
    }

    setIsLoading(false);
  }, [router, dispatch]);

  const handleSubmitBranch = async (branchData: CreateBranchData | UpdateBranchData) => {
    try {
      if (editingBranch) {
        await dispatch(updateBranch(branchData as UpdateBranchData)).unwrap();
        
        Swal.fire({
          icon: 'success',
          title: 'Branch Updated!',
          text: 'The branch has been updated successfully.',
          confirmButtonColor: '#C3EAE7',
        });
      } else {
        await dispatch(createBranch(branchData as CreateBranchData)).unwrap();
        
        Swal.fire({
          icon: 'success',
          title: 'Branch Created!',
          text: 'The branch has been created successfully.',
          confirmButtonColor: '#C3EAE7',
        });
      }
      
      if (profile?.id) {
        dispatch(fetchBranches(profile.id));
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: editingBranch ? 'Update Failed' : 'Creation Failed',
        text: error.message || `Failed to ${editingBranch ? 'update' : 'create'} branch. Please try again.`,
        confirmButtonColor: '#C3EAE7',
      });
      throw error; 
    }
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
  };

  const handleBranchUpdated = () => {
    if (profile?.id) {
      dispatch(fetchBranches(profile.id));
    }
  };

  const openCreateModal = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view your branches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBarPracticeUser />
      
      <div className="flex-1 flex flex-col py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C3EAE7] rounded-full flex items-center justify-center">
                    <FiHome className="w-6 h-6 text-black" />
                  </div>
                  Practice Branches
                </h1>
                <p className="text-gray-600">
                  Manage your practice branches and locations. Add new branches to expand your practice reach.
                </p>
              </div>
              
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-6 py-3 bg-[#C3EAE7] text-black font-bold rounded-xl 
                         hover:bg-[#A9DBD9] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105
                         self-start sm:self-auto"
              >
                <FiPlus className="text-xl" />
                Create New Branch
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Branches</p>
                  <p className="text-2xl font-bold text-gray-900">{branches.length}</p>
                </div>
                <div className="w-12 h-12 bg-[#C3EAE7] rounded-full flex items-center justify-center">
                  <FiHome className="w-6 h-6 text-black" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Branches</p>
                  <p className="text-2xl font-bold text-green-600">
                    {branches.filter(branch => branch.status === 'active').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending/Verify</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {branches.filter(branch => branch.status === 'pending approval' || branch.status === 'verify').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">
                    {branches.filter(branch => branch.status === 'inactive' || branch.status === 'cancel').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <BranchesTable
              branches={branches}
              loading={loading}
              onBranchUpdated={handleBranchUpdated}
              onEditBranch={handleEditBranch}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Branch Management
            </h3>
            <div className="text-blue-800 space-y-2">
              <p>• <strong>Create branches</strong> to manage multiple locations for your practice.</p>
              <p>• <strong>Email Verification:</strong> New branches must verify their email before admin approval.</p>
              <p>• <strong>Active branches</strong> are fully approved and available for appointment scheduling.</p>
              <p>• <strong>Pending approval branches</strong> have verified their email and await admin approval.</p>
              <p>• <strong>Admin Approval:</strong> Click the checkmark icon to approve pending branches.</p>
              <p>• <strong>Contact information</strong> helps locums and patients reach the specific branch.</p>
            </div>
          </div>
        </div>
      </div>

      <BranchModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitBranch}
        branch={editingBranch}
        practiceId={profile.id}
        loading={loading}
      />
      
      <Footer />
    </div>
  );
};

export default BranchesPage;
