import React from 'react'
import { useCartStore } from '../store/store'

const MenuItemCard = ({ item }) => {
  const { addItem } = useCartStore()

  const handleAddToCart = () => {
    if (item.isAvailable) {
      addItem(item, 1, '')
    }
  }

  return (
    <div className={`bg-white rounded-xl p-6 shadow-md transition-all duration-200 hover:shadow-lg ${
      !item.isAvailable ? 'opacity-60' : ''
    }`}>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
          {!item.isAvailable && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Out of Stock
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
        <p className="font-semibold text-gray-900 text-base mb-3">₹{item.price}</p>
        <div className="self-end">
          <button 
            onClick={handleAddToCart}
            disabled={!item.isAvailable}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              item.isAvailable 
                ? 'bg-black text-white hover:bg-gray-800' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {item.isAvailable ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MenuItemCard
