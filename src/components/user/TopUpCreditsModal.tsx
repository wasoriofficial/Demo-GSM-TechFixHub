import { useState, useEffect } from 'react';
import { addTopUpRequest, getUserTopUpRequests, getBankDetails } from '../../utils/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { Check, CreditCard, History, Upload, X } from 'lucide-react';
import { format } from 'date-fns';

interface TopUpCreditsModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const TopUpCreditsModal = ({ onClose, onSuccess }: TopUpCreditsModalProps) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(0);
  const [bankAccount, setBankAccount] = useState<string>('');
  const [imageProof, setImageProof] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [topupHistory, setTopupHistory] = useState<any[]>([]);
  const [bankDetails, setBankDetails] = useState<any>({
    name: "Digital Services Corp.",
    banks: []
  });

  useEffect(() => {
    if (user) {
      const history = getUserTopUpRequests(user.id);
      setTopupHistory(history);
    }
    // Load bank details from localStorage
    const details = getBankDetails();
    setBankDetails(details);
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size exceeds 5MB limit");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageProof(reader.result as string);
        setError(null);
      };
      reader.onerror = () => {
        setError("Error reading file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!user) return;
    
    // Validate form
    if (amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    if (!bankAccount) {
      setError("Please enter the bank account information");
      return;
    }
    
    if (!imageProof) {
      setError("Please upload payment proof");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      addTopUpRequest({
        userId: user.id,
        userName: user.name,
        amount,
        bankAccount,
        imageProof
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError("Failed to submit top-up request. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Format to IDR
  const formatIDR = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] flex flex-col">
        {isSuccess ? (
          <div className="text-center py-8">
            <Check size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Top Up Request Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your request for {formatIDR(amount)} has been submitted for review. 
              Credits will be added to your account once approved.
            </p>
            <button
              onClick={onSuccess}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{showHistory ? "TopUp History" : "Top Up Credits"}</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {showHistory ? "Back to TopUp" : <><History size={16} /> History</>}
                </button>
                <button 
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {showHistory ? (
              <div className="overflow-y-auto flex-1">
                {topupHistory.length > 0 ? (
                  <div className="space-y-4">
                    {topupHistory.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-500">{format(new Date(request.date), 'MMM dd, yyyy')}</span>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="font-medium">{formatIDR(request.amount)}</p>
                        {request.notes && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm border border-blue-100">
                            <p className="font-medium text-xs text-blue-800 mb-1">Admin Reply:</p>
                            <p>{request.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No top-up history found.
                  </div>
                )}
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                    {error}
                  </div>
                )}
                
                <div className="overflow-y-auto flex-1 pr-2">
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-medium text-blue-800 mb-2">How to Top Up</h3>
                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                      <li>Enter the amount you wish to top up</li>
                      <li>Transfer the exact amount to one of our bank accounts below</li>
                      <li>Fill in your bank details for verification</li>
                      <li>Upload proof of payment (screenshot/photo)</li>
                      <li>Submit your request and wait for approval</li>
                    </ol>
                  </div>

                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium mb-2">Bank Transfer Details</h3>
                    {bankDetails.banks.map((bank: any, index: number) => (
                      <div key={index} className="mb-2 last:mb-0">
                        <p className="font-medium">{bank.name}</p>
                        <p className="text-sm">Account: {bank.account}</p>
                        <p className="text-sm">Name: {bank.accountName}</p>
                      </div>
                    ))}
                  </div>
                
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Top Up (IDR)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCard size={18} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          min="10000"
                          step="10000"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="10000"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Minimum amount: Rp 10,000</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Bank Account Information</label>
                      <textarea
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Bank Name: BCA&#10;Account Number: 1234567890&#10;Account Name: John Doe"
                        rows={3}
                      />
                      <p className="mt-1 text-xs text-gray-500">Please include bank name, account number, and account name</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Proof</label>
                      {imageProof ? (
                        <div className="relative">
                          <img 
                            src={imageProof} 
                            alt="Payment proof" 
                            className="w-full h-40 object-cover rounded-md border border-gray-300"
                          />
                          <button 
                            onClick={() => setImageProof(null)}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                          >
                            <X size={16} className="text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
                          <Upload size={24} className="text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 mb-2">Upload an image of your payment proof</p>
                          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                            Choose File
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="mt-1 text-xs text-gray-500">Max size: 5MB</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`w-full px-4 py-2 text-white rounded-lg flex items-center justify-center gap-2
                          ${isSubmitting 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {isSubmitting ? 'Processing...' : 'Submit Top Up Request'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TopUpCreditsModal;
