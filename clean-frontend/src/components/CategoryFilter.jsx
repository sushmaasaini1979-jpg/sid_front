import React from 'react'

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const allCategories = [
    { id: 'all', name: 'All', slug: 'all' },
    ...categories
  ]

  return (
    <div className="px-4 py-3">
      <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
        {allCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.slug)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.slug
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryFilter
