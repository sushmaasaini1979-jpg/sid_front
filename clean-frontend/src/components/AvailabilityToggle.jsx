import React, { useState } from 'react'
import { api } from '../lib/api'

const AvailabilityToggle = ({ 
  itemId, 
  isAvailable: initialAvailable, 
  onToggle, 
  storeSlug = 'siddhi',
  disabled = false 
}) => {
  const [isAvailable, setIsAvailable] = useState(initialAvailable)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    if (isLoading || disabled) return

    setIsLoading(true)
    const newAvailability = !isAvailable

    try {
      const response = await api.updateItemAvailability(itemId, newAvailability, storeSlug)
      
      if (response.success) {
        setIsAvailable(newAvailability)
        onToggle?.(newAvailability, response.statistics)
      } else {
        console.error('Failed to update availability:', response.error)
        // Revert the toggle on error
        setIsAvailable(isAvailable)
      }
    } catch (error) {
      console.error('Error updating availability:', error)
      // Revert the toggle on error
      setIsAvailable(isAvailable)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Status Label */}
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isAvailable ? 'Available' : 'Out of Stock'}
      </span>

      {/* Toggle Switch */}
      <button
        onClick={handleToggle}
        disabled={isLoading || disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          isAvailable ? 'bg-green-600' : 'bg-gray-200'
        } ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isAvailable ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      )}
    </div>
  )
}

export default AvailabilityToggle
