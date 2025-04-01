import React from 'react'
import SearchBar from '../components/SearchBar'
import Button from '../components/Button'

function Home() {
  return (
    <div className="flex flex-col w-full justify-center items-center">
      <div className="absolute top-0 right-0 w-full flex justify-end p-5 pr-25 space-x-5">
        <Button value="Review a Club"/>
        <Button value="Sign In"/>
      </div>
      <h2 className="text-8xl font-bold text-blue-700 my-10">BruinSphere</h2>
      <div className="flex flex-col space-y-3 w-1/2 justify-end items-end">
        <SearchBar width="w-full" height="h-13"/>
        <Button value="Search"/>
      </div>
    </div>
  )
}

export default Home