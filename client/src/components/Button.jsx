import React from 'react';
import { Link } from 'react-router-dom';

function Button({ value, to }) {
  return (
	<Link 
		to={to}
		className="!bg-blue-700 !border-blue-600 text-white !text-lg !rounded-xl !py-1">
		{value}
	</Link>
  )
}

export default Button