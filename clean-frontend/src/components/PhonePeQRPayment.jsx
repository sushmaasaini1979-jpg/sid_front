import React, { useState } from 'react'

const PhonePeQRPayment = ({ amount, onPaymentConfirm, onCancel }) => {
  const [isPaid, setIsPaid] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handlePaymentConfirm = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmYes = () => {
    setIsPaid(true)
    setShowConfirmDialog(false)
    onPaymentConfirm()
  }

  const handleConfirmNo = () => {
    setShowConfirmDialog(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pay with PhonePe
          </h3>
          
          {/* QR Code */}
          <div className="mb-6 flex justify-center">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <img 
                src="/phonepe-qr.png" 
                alt="PhonePe QR Code" 
                className="w-48 h-48 mx-auto"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'block'
                }}
              />
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center hidden">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">PhonePe QR Code</p>
                </div>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="mb-6">
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(amount)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Scan QR code with PhonePe app to pay
            </p>
          </div>

          {/* Instructions */}
          <div className="mb-6 text-left">
            <h4 className="font-medium text-gray-900 mb-2">How to pay:</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Open PhonePe app on your phone</li>
              <li>2. Tap on "Scan & Pay"</li>
              <li>3. Scan the QR code above</li>
              <li>4. Enter amount: {formatPrice(amount)}</li>
              <li>5. Complete the payment</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePaymentConfirm}
              disabled={isPaid}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              {isPaid ? 'Payment Confirmed' : 'I Have Paid'}
            </button>
          </div>

          {isPaid && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                ✅ Payment confirmed! Your order is being processed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Payment
            </h4>
            <p className="text-gray-600 mb-6">
              Have you successfully completed the payment of {formatPrice(amount)} using PhonePe?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleConfirmNo}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                No, Not Yet
              </button>
              <button
                onClick={handleConfirmYes}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Yes, Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhonePeQRPayment
