import React from 'react'

function Button({ value }) {
  return (
	<button 
		className="!bg-blue-700 !border-blue-600 text-white !text-lg !rounded-xl !py-1">
		{value}
	</button>
  )
}

export default Button