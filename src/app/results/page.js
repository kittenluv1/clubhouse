"use client";

import React, { useEffect, useState } from 'react';

function ResultsPage() {
	const [data, setData] = useState({ orgList: [] });

	useEffect(() => {
		fetch("/api").then(
			response => response.json()
		).then(
			jsonData => {
				setData(jsonData)
			}
		)
	}, [])

  return (
	<div>
      {data.orgList.length === 0 ? (
        <p>Loading...</p>
      ) : (
        data.orgList.map((club, i) => (
          <div key={i}>
            <h3>{club.OrganizationName}</h3>
            <p>{club.OrganizationDescription}</p>
            <p>Email: <a href={`mailto:${club.OrganizationEmail}`}>{club.OrganizationEmail}</a></p>
            <p>Website: <a href={club.OrganizationWebSite} target="_blank" rel="noopener noreferrer">{club.OrganizationWebSite}</a></p>
            <p>Category: {club.Category1Name} - {club.Category2Name}</p>
            <div>
              <strong>Signatures:</strong>
              <ul>
                <li>{club.Sig1Name}</li>
                <li>{club.Sig2Name}</li>
                <li>{club.Sig3Name}</li>
              </ul>
            </div>
            <div dangerouslySetInnerHTML={{ __html: club.SocialMediaLink }} />
          </div>
        ))
      )}
	</div>
  )
}

export default ResultsPage