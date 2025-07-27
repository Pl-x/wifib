import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Edit, Trash2, Wifi, Zap, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

function Plans() {
  const { plans, customers } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // const formData = new FormData(e.target);
    
    if (editingPlan) {
      // Update plan logic would go here
      toast.success('Plan updated successfully!');
    } else {
      // Add plan logic would go here
      toast.success('Plan added successfully!');
    }

    setShowModal(false);
    setEditingPlan(null);
    e.target.reset();
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleDelete = (planId) => {
    const customersUsingPlan = customers.filter(customer => 
      customer.plan.includes(plans.find(p => p.id === planId)?.name)
    );
    
    if (customersUsingPlan.length > 0) {
      toast.error(`Cannot delete plan that is used by ${customersUsingPlan.length} customers`);
      return;
    }

    if (window.confirm('Are you sure you want to delete this plan?')) {
      // Delete plan logic would go here
      toast.success('Plan deleted successfully!');
    }
  };

  const getPlanIcon = (planName) => {
    if (planName.includes('Basic')) return <Wifi className="w-6 h-6" />;
    if (planName.includes('Premium')) return <Zap className="w-6 h-6" />;
    if (planName.includes('Ultra')) return <Crown className="w-6 h-6" />;
    return <Wifi className="w-6 h-6" />;
  };

  const getPlanColor = (planName) => {
    if (planName.includes('Basic')) return 'from-blue-500 to-blue-600';
    if (planName.includes('Premium')) return 'from-purple-500 to-purple-600';
    if (planName.includes('Ultra')) return 'from-orange-500 to-orange-600';
    return 'from-gray-500 to-gray-600';
  };

  const getCustomersCount = (planName) => {
    return customers.filter(customer => customer.plan.includes(planName)).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Internet Plans</h1>
          <p className="text-gray-600">Manage tariff plans and services</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Plan</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${getPlanColor(plan.name)}`}>
                {getPlanIcon(plan.name)}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="text-blue-600 hover:text-blue-900 p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-red-600 hover:text-red-900 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">₽{plan.price}</div>
            <div className="text-sm text-gray-600 mb-4">per month</div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Speed:</span>
                <span className="text-sm font-medium text-gray-900">{plan.speed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data:</span>
                <span className="text-sm font-medium text-gray-900">{plan.dataLimit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Customers:</span>
                <span className="text-sm font-medium text-gray-900">{getCustomersCount(plan.name)}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

            <div className="flex space-x-2">
              <button className="btn btn-outline flex-1 text-sm">
                Details
              </button>
              <button className="btn btn-primary flex-1 text-sm">
                Select
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Plans</p>
              <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Wifi className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₽{(plans.reduce((sum, plan) => sum + plan.price, 0) / plans.length).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingPlan ? 'Edit Plan' : 'Add Plan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingPlan?.name}
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speed (Mbps)
                </label>
                <input
                  type="text"
                  name="speed"
                  defaultValue={editingPlan?.speed}
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₽/month)
                </label>
                <input
                  type="number"
                  name="price"
                  defaultValue={editingPlan?.price}
                  step="0.01"
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Limit
                </label>
                <select name="dataLimit" defaultValue={editingPlan?.dataLimit} className="input">
                  <option value="Unlimited">Unlimited</option>
                  <option value="500 GB">500 GB</option>
                  <option value="1 TB">1 TB</option>
                  <option value="2 TB">2 TB</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingPlan?.description}
                  rows="3"
                  className="input"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  {editingPlan ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPlan(null);
                  }}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Plans; 