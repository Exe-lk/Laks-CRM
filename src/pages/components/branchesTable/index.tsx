import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiMapPin, FiPhone, FiMail, FiHome } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { Branch, updateBranch, deleteBranch } from '../../../redux/slices/branchPracticeSlice';
import { AppDispatch } from '../../../redux/store';
import { useDispatch } from 'react-redux';

interface BranchesTableProps {
  branches: Branch[];
  loading: boolean;
  onBranchUpdated: () => void;
  onEditBranch: (branch: Branch) => void;
}

const BranchesTable: React.FC<BranchesTableProps> = ({
  branches = [],
  loading = false,
  onBranchUpdated = () => {},
  onEditBranch = () => {}
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteBranch = async (branch: Branch) => {
    const result = await Swal.fire({
      title: 'Delete Branch',
      html: `
        <div class="text-left">
          <p class="mb-3">Are you sure you want to delete this branch?</p>
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="font-semibold text-gray-800">${branch.name}</p>
            <p class="text-sm text-gray-600">${branch.address}</p>
            <p class="text-sm text-gray-600">${branch.location}</p>
          </div>
          <p class="mt-3 text-red-600 text-sm">This action cannot be undone.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete Branch',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        setDeletingId(branch.id);
        await dispatch(deleteBranch(branch.id)).unwrap();
        
        Swal.fire({
          icon: 'success',
          title: 'Branch Deleted',
          text: 'The branch has been successfully deleted.',
          confirmButtonColor: '#C3EAE7',
        });
        
        onBranchUpdated();
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: error.message || 'Failed to delete branch. Please try again.',
          confirmButtonColor: '#C3EAE7',
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <FiHome className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Branches Found</h3>
          <p className="text-gray-600 mb-4">
            You haven't created any branches yet. Create your first branch to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FiHome className="w-5 h-5 text-[#C3EAE7]" />
          Practice Branches ({branches.length})
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Information
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {branches.map((branch) => (
              <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FiHome className="w-4 h-4 text-[#C3EAE7]" />
                      <span className="font-medium text-gray-900">{branch.name}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{branch.address}</p>
                        <p className="text-gray-500">{branch.location}</p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {branch.telephone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiPhone className="w-4 h-4 text-gray-400" />
                        <span>{branch.telephone}</span>
                      </div>
                    )}
                    {branch.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiMail className="w-4 h-4 text-gray-400" />
                        <span>{branch.email}</span>
                      </div>
                    )}
                    {!branch.telephone && !branch.email && (
                      <span className="text-sm text-gray-400 italic">No contact info</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    branch.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : branch.status === 'pending approval'
                      ? 'bg-yellow-100 text-yellow-800'
                      : branch.status === 'cancel'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      branch.status === 'active' 
                        ? 'bg-green-500' 
                        : branch.status === 'pending approval'
                        ? 'bg-yellow-500'
                        : branch.status === 'cancel'
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                    }`}></div>
                    {branch.status === 'active' 
                      ? 'Active' 
                      : branch.status === 'pending approval'
                      ? 'Pending Approval'
                      : branch.status === 'cancel'
                      ? 'Cancelled'
                      : 'Unknown'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(branch.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEditBranch(branch)}
                      className="p-2 text-gray-400 hover:text-[#C3EAE7] hover:bg-[#C3EAE7]/10 rounded-lg transition-colors"
                      title="Edit Branch"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(branch)}
                      disabled={deletingId === branch.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Branch"
                    >
                      {deletingId === branch.id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FiTrash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BranchesTable;
