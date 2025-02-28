import { useState, useEffect } from 'react';
import { getTopUpRequests, getUser, updateTopUpRequest, addCredits, updateUser, deleteTopUpRequest, getBankDetails, updateBankDetails } from '../utils/dataService';
import { format } from 'date-fns';
import { CircleCheck, CircleX, Clock, Download, Filter, Image, Pencil, Search, Trash2 } from 'lucide-react';

const TopUpRequestsPage = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isBankDetailsModalOpen, setIsBankDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [replyCode, setReplyCode] = useState('');
  const [bankDetails, setBankDetails] = useState<any>({
    name: "",
    banks: []
  });

  useEffect(() => {
    loadRequests();
    loadBankDetails();
  }, []);

  useEffect(() => {
    let result = requests;
    
    // Filter by status
    if (selectedStatus !== 'all') {
      result = result.filter(request => request.status === selectedStatus);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(request => 
        request.userName.toLowerCase().includes(query) ||
        request.bankAccount.toLowerCase().includes(query)
      );
    }
    
    setFilteredRequests(result);
  }, [selectedStatus, searchQuery, requests]);

  const loadRequests = () => {
    const allRequests = getTopUpRequests();
    setRequests(allRequests);
    setFilteredRequests(allRequests);
  };

  const loadBankDetails = () => {
    const details = getBankDetails();
    setBankDetails(details);
  };

  // Format to IDR
  const formatIDR = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const viewRequestDetails = (request: any) => {
    setSelectedRequest(request);
    setReplyCode(request.notes || '');
    setIsDetailsModalOpen(true);
  };

  const handleApproveRequest = () => {
    if (!selectedRequest) return;
    
    // Get user
    const user = getUser(selectedRequest.userId);
    if (!user) return;
    
    // Add credits to user
    addCredits(selectedRequest.userId, selectedRequest.amount);
    
    // Update request status
    updateTopUpRequest(selectedRequest.id, { 
      status: 'approved', 
      notes: replyCode,
      processedDate: new Date().toISOString() 
    });
    
    // Reload data
    loadRequests();
    setIsDetailsModalOpen(false);
    
    // Open print modal
    setIsPrintModalOpen(true);
  };

  const handleRejectRequest = () => {
    if (!selectedRequest) return;
    
    // Update request status
    updateTopUpRequest(selectedRequest.id, { 
      status: 'rejected', 
      notes: replyCode,
      processedDate: new Date().toISOString() 
    });
    
    // Reload data
    loadRequests();
    setIsDetailsModalOpen(false);
  };

  const handleDeleteRequest = () => {
    if (!selectedRequest) return;
    
    // Delete the request
    deleteTopUpRequest(selectedRequest.id);
    
    // Reload data
    loadRequests();
    setIsDeleteModalOpen(false);
  };

  const openDeleteModal = (request: any) => {
    setSelectedRequest(request);
    setIsDeleteModalOpen(true);
  };

  const handleBankDetailsChange = (index: number, field: string, value: string) => {
    const updatedBanks = [...bankDetails.banks];
    updatedBanks[index] = { ...updatedBanks[index], [field]: value };
    
    setBankDetails({
      ...bankDetails,
      banks: updatedBanks
    });
  };

  const handleAddBank = () => {
    setBankDetails({
      ...bankDetails,
      banks: [...bankDetails.banks, { name: "", account: "", accountName: "" }]
    });
  };

  const handleRemoveBank = (index: number) => {
    const updatedBanks = [...bankDetails.banks];
    updatedBanks.splice(index, 1);
    
    setBankDetails({
      ...bankDetails,
      banks: updatedBanks
    });
  };

  const handleSaveBankDetails = () => {
    updateBankDetails(bankDetails);
    setIsBankDetailsModalOpen(false);
  };

  const printInvoice = () => {
    if (!selectedRequest) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website to print receipts.');
      return;
    }
    
    // Generate the receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - #${selectedRequest.id.slice(0, 8)}</title>
          <meta charset="UTF-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .receipt {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #ddd;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px solid #eee;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .table th, .table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            .table th {
              background-color: #f2f2f2;
            }
            .total-row {
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #777;
              font-size: 14px;
            }
            @media print {
              body {
                padding: 0;
              }
              .receipt {
                box-shadow: none;
                border: none;
              }
              @page {
                margin: 0.5cm;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>PAYMENT RECEIPT</h2>
              <p>Digital Services Platform</p>
            </div>
            
            <div class="info-row">
              <div>
                <p><strong>Receipt No:</strong> INV-${selectedRequest.id.slice(0, 8)}</p>
              </div>
              <div>
                <p><strong>Date:</strong> ${format(new Date(), 'MMM dd, yyyy')}</p>
              </div>
            </div>
            
            <div class="info-row">
              <div>
                <p><strong>Customer:</strong> ${selectedRequest.userName}</p>
              </div>
            </div>
            
            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Credit Top-up</td>
                  <td style="text-align: right;">${formatIDR(selectedRequest.amount)}</td>
                </tr>
                <tr class="total-row">
                  <td>Total</td>
                  <td style="text-align: right;">${formatIDR(selectedRequest.amount)}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>This is a computer-generated receipt and requires no signature.</p>
              <p>Printed on: ${format(new Date(), 'MMM dd, yyyy HH:mm:ss')}</p>
            </div>
          </div>
          <script>
            // Print and close the window when loaded
            window.onload = function() {
              window.print();
              // Close the window after print dialog is closed (modern browsers)
              window.onafterprint = function() { window.close(); };
              // Fallback for browsers that don't support onafterprint
              setTimeout(function() {
                if (!window.closed) {
                  window.close();
                }
              }, 10000); // Close after 10 seconds if not closed already
            };
          </script>
        </body>
      </html>
    `;
    
    // Write to the new window
    printWindow.document.open();
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">TopUp Requests</h1>
        <button
          onClick={() => setIsBankDetailsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Pencil size={16} />
          Pencil Bank Details
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user name or bank account"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="md:w-48">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-gray-400" />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredRequests.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank Account
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{format(new Date(request.date), 'MMM dd, yyyy')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{request.bankAccount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatIDR(request.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => viewRequestDetails(request)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => openDeleteModal(request)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Clock size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No TopUp Requests Found</h2>
          <p className="text-gray-500 mb-4">
            {requests.length === 0
              ? "There are no top-up requests yet."
              : "No requests match your current filters."}
          </p>
        </div>
      )}

      {/* Request Details Modal */}
      {isDetailsModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">TopUp Request Details</h2>
            
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="font-medium">{selectedRequest.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{format(new Date(selectedRequest.date), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">{formatIDR(selectedRequest.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${selectedRequest.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      selectedRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Bank Account Information</p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <pre className="text-sm whitespace-pre-wrap">{selectedRequest.bankAccount}</pre>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Payment Proof</p>
                {selectedRequest.imageProof ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img src={selectedRequest.imageProof} alt="Payment proof" className="w-full h-auto max-h-60 object-contain" />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No image provided</p>
                )}
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reply to User
                  </label>
                  <textarea
                    value={replyCode}
                    onChange={(e) => setReplyCode(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                    rows={3}
                    placeholder="Enter reply code or message for the user"
                  ></textarea>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={handleRejectRequest}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 flex items-center gap-1"
                  >
                    <CircleX size={16} />
                    Reject
                  </button>
                  <button
                    onClick={handleApproveRequest}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center gap-1"
                  >
                    <CircleCheck size={16} />
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete TopUp Request</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this top-up request from {selectedRequest.userName} for {formatIDR(selectedRequest.amount)}?
            </p>
            <p className="text-red-600 text-sm mb-4">
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRequest}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 flex items-center gap-1"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Pencil Modal */}
      {isBankDetailsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Pencil Bank Transfer Details</h2>
            <p className="text-sm text-gray-500 mb-4">
              These details will be shown to users when they request a top-up.
            </p>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company/Organization Name</label>
                <input
                  type="text"
                  value={bankDetails.name}
                  onChange={(e) => setBankDetails({...bankDetails, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Bank Accounts</h3>
                  <button
                    onClick={handleAddBank}
                    className="px-2 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
                  >
                    Add Bank
                  </button>
                </div>
                
                {bankDetails.banks.length > 0 ? (
                  <div className="space-y-4">
                    {bankDetails.banks.map((bank: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between mb-2">
                          <h4 className="text-sm font-medium">Bank #{index + 1}</h4>
                          <button
                            onClick={() => handleRemoveBank(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-gray-500">Bank Name</label>
                            <input
                              type="text"
                              value={bank.name}
                              onChange={(e) => handleBankDetailsChange(index, 'name', e.target.value)}
                              className="w-full border border-gray-300 rounded-md p-2 text-sm"
                              placeholder="e.g., Bank Central Asia (BCA)"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500">Account Number</label>
                            <input
                              type="text"
                              value={bank.account}
                              onChange={(e) => handleBankDetailsChange(index, 'account', e.target.value)}
                              className="w-full border border-gray-300 rounded-md p-2 text-sm"
                              placeholder="e.g., 1234567890"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500">Account Name</label>
                            <input
                              type="text"
                              value={bank.accountName}
                              onChange={(e) => handleBankDetailsChange(index, 'accountName', e.target.value)}
                              className="w-full border border-gray-300 rounded-md p-2 text-sm"
                              placeholder="e.g., Digital Services"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No bank accounts added yet. Click "Add Bank" to add one.
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsBankDetailsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBankDetails}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Invoice Modal */}
      {isPrintModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="border border-gray-200 p-6 mb-4 print:border-0">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">PAYMENT RECEIPT</h2>
                <p className="text-gray-500">Digital Services Platform</p>
              </div>
              
              <div className="border-t border-b border-gray-200 py-4 my-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Receipt No:</p>
                    <p className="font-medium">INV-{selectedRequest.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Date:</p>
                    <p className="font-medium">{format(new Date(), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Customer:</p>
                <p className="font-medium">{selectedRequest.userName}</p>
              </div>
              
              <div className="mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2">Credit Top-up</td>
                      <td className="px-4 py-2 text-right">{formatIDR(selectedRequest.amount)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200">
                      <td className="px-4 py-2 font-bold">Total</td>
                      <td className="px-4 py-2 text-right font-bold">{formatIDR(selectedRequest.amount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="mt-8 text-center text-sm text-gray-500">
                <p>Thank you for your business!</p>
                <p>This is a computer-generated receipt and requires no signature.</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={printInvoice}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
              >
                <Download size={16} />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopUpRequestsPage;
