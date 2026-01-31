import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Phone, MessageCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import CreateLeadModal from '../components/CreateLeadModal';

const Leads = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, [search]); // Debounce recommended for prod

    const fetchLeads = async () => {
        try {
            const params = {};
            if (search) params.search = search;

            const { data } = await api.get('/leads', { params });
            setLeads(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLeadCreated = (newLead) => {
        setLeads([newLead, ...leads]);
    };

    const handleLeadClick = (leadId) => {
        navigate(`/leads/${leadId}`);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white p-2 rounded-full shadow-lg md:rounded-md md:px-4 md:py-2 flex items-center hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    <span className="hidden md:inline ml-2">New Lead</span>
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name, phone..."
                    className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : leads.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500 text-lg">No leads found</p>
                    <p className="text-gray-400 mt-2">Click "New Lead" to create your first lead</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {leads.map((lead) => (
                        <div
                            key={lead.id}
                            className="bg-white p-4 rounded-lg shadow border border-gray-100 hover:shadow-md transition cursor-pointer"
                            onClick={() => handleLeadClick(lead.id)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{lead.full_name}</h3>
                                    <p className="text-gray-500 text-sm">{lead.status}</p>
                                </div>
                                {/* Interest Badge */}
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${lead.interest_type === 'buy' ? 'bg-green-100 text-green-800' :
                                        lead.interest_type === 'rent' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100'
                                    }`}>
                                    {lead.interest_type?.toUpperCase() || 'BUY'}
                                </span>
                            </div>

                            <div className="mt-4 text-sm text-gray-600">
                                {lead.email && <p className="truncate">{lead.email}</p>}
                                <p className="mt-1">Loc: {lead.preferred_location || 'Any'}</p>
                                {lead.next_followup_at && (
                                    <p className="mt-1 text-red-500 font-medium">
                                        Follow-up: {format(new Date(lead.next_followup_at), 'MMM d, HH:mm')}
                                    </p>
                                )}
                            </div>

                            <div className="mt-4 flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                <a
                                    href={`tel:${lead.phone}`}
                                    className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg flex justify-center items-center hover:bg-green-100 border border-green-200"
                                >
                                    <Phone size={18} className="mr-2" /> Call
                                </a>
                                <a
                                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg flex justify-center items-center hover:bg-green-100 border border-green-200"
                                >
                                    <MessageCircle size={18} className="mr-2" /> WA
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateLeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleLeadCreated}
            />
        </div>
    );
};

export default Leads;
