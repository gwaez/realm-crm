import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Phone, Mail, MapPin, DollarSign, Calendar, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

const LeadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activityForm, setActivityForm] = useState({
        type: 'call',
        result: '',
        comment: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLead();
    }, [id]);

    const fetchLead = async () => {
        try {
            const { data } = await api.get(`/leads/${id}`);
            setLead(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleActivitySubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { data } = await api.post(`/leads/${id}/activities`, activityForm);
            setLead({
                ...lead,
                activities: [data, ...(lead.activities || [])]
            });
            setActivityForm({
                type: 'call',
                result: '',
                comment: ''
            });
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Lead not found</p>
                <button onClick={() => navigate('/leads')} className="mt-4 text-blue-600 hover:underline">
                    Back to Leads
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/leads')}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Leads
                </button>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{lead.full_name}</h1>
                        <div className="flex items-center mt-2 space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                                    lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                                        lead.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                                            lead.status === 'Won' ? 'bg-green-600 text-white' :
                                                lead.status === 'Lost' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {lead.status}
                            </span>
                            <span className="text-gray-500 text-sm">
                                Created {format(new Date(lead.created_at), 'MMM d, yyyy')}
                            </span>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <a
                            href={`tel:${lead.phone}`}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                        >
                            <Phone size={18} className="mr-2" />
                            Call
                        </a>
                        <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                        >
                            <MessageCircle size={18} className="mr-2" />
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lead Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Info Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
                        <div className="space-y-3">
                            <div className="flex items-center text-gray-700">
                                <Phone size={18} className="mr-3 text-gray-400" />
                                <span>{lead.phone}</span>
                            </div>
                            {lead.email && (
                                <div className="flex items-center text-gray-700">
                                    <Mail size={18} className="mr-3 text-gray-400" />
                                    <span>{lead.email}</span>
                                </div>
                            )}
                            {lead.preferred_location && (
                                <div className="flex items-center text-gray-700">
                                    <MapPin size={18} className="mr-3 text-gray-400" />
                                    <span>{lead.preferred_location}</span>
                                </div>
                            )}
                            {(lead.budget_min || lead.budget_max) && (
                                <div className="flex items-center text-gray-700">
                                    <DollarSign size={18} className="mr-3 text-gray-400" />
                                    <span>
                                        Budget: {lead.budget_min?.toLocaleString()} - {lead.budget_max?.toLocaleString()} AED
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {lead.notes && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Notes</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
                        </div>
                    )}

                    {/* Activities */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Activity Timeline</h2>

                        {/* Add Activity Form */}
                        <form onSubmit={handleActivitySubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={activityForm.type}
                                        onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="call">Call</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="email">Email</option>
                                        <option value="meeting">Meeting</option>
                                        <option value="note">Note</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
                                    <input
                                        type="text"
                                        value={activityForm.result}
                                        onChange={(e) => setActivityForm({ ...activityForm, result: e.target.value })}
                                        placeholder="e.g., Answered, No Answer"
                                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                                <textarea
                                    value={activityForm.comment}
                                    onChange={(e) => setActivityForm({ ...activityForm, comment: e.target.value })}
                                    rows="3"
                                    placeholder="Add your notes here..."
                                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? 'Adding...' : 'Add Activity'}
                            </button>
                        </form>

                        {/* Activities List */}
                        <div className="space-y-4">
                            {lead.activities && lead.activities.length > 0 ? (
                                lead.activities.map((activity) => (
                                    <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-semibold text-gray-800 capitalize">{activity.type}</span>
                                                {activity.result && (
                                                    <span className="ml-2 text-sm text-gray-600">- {activity.result}</span>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {format(new Date(activity.created_at), 'MMM d, HH:mm')}
                                            </span>
                                        </div>
                                        {activity.comment && (
                                            <p className="text-gray-700 mt-1">{activity.comment}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">by {activity.user_name}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No activities yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-bold text-gray-800 mb-4">Quick Info</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-gray-500">Source:</span>
                                <span className="ml-2 font-medium">{lead.source}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Interest:</span>
                                <span className="ml-2 font-medium capitalize">{lead.interest_type || 'Buy'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Language:</span>
                                <span className="ml-2 font-medium">{lead.language || 'English'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Assigned To:</span>
                                <span className="ml-2 font-medium">You</span>
                            </div>
                        </div>
                    </div>

                    {/* Next Follow-up */}
                    {lead.next_followup_at && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center text-orange-800">
                                <Calendar size={18} className="mr-2" />
                                <span className="font-semibold">Next Follow-up</span>
                            </div>
                            <p className="mt-2 text-orange-900">
                                {format(new Date(lead.next_followup_at), 'MMM d, yyyy HH:mm')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadDetail;
