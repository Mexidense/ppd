'use client'

import { useState } from 'react'
import { useWallet } from './wallet-provider'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'

export function UploadDocument() {
  const { address, identityKey, isConnected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  
  // Form state
  const [title, setTitle] = useState('')
  const [cost, setCost] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        showMessage('Please select a PDF file', 'error')
        e.target.value = ''
        return
      }
      
      // Validate file size (50MB max)
      if (selectedFile.size > 50 * 1024 * 1024) {
        showMessage('File size must be less than 50MB', 'error')
        e.target.value = ''
        return
      }
      
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      showMessage('Please connect your wallet first', 'error')
      return
    }

    if (!file) {
      showMessage('Please select a PDF file', 'error')
      return
    }

    if (!title.trim()) {
      showMessage('Please enter a title', 'error')
      return
    }

    if (!cost || parseInt(cost) < 0) {
      showMessage('Please enter a valid cost in satoshis', 'error')
      return
    }

    setLoading(true)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title.trim())
      formData.append('cost', cost)
      formData.append('address_owner', identityKey || address || '')

      showMessage('Uploading document...', 'info')

      // Upload document
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('Document uploaded successfully!', 'success')
        
        // Reset form
        setTitle('')
        setCost('')
        setFile(null)
        
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        // Optionally redirect or refresh
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        showMessage(data.error || 'Failed to upload document', 'error')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      showMessage('Error: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Please connect your wallet to upload documents
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Upload Document</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <label htmlFor="file-input" className="block text-sm font-medium mb-2">
              PDF File *
            </label>
            <input
              id="file-input"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={loading}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:border-primary"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              placeholder="Enter document title"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* Cost */}
          <div>
            <label htmlFor="cost" className="block text-sm font-medium mb-2">
              Cost (Satoshis) *
            </label>
            <input
              id="cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              disabled={loading}
              placeholder="1000"
              min="0"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              required
            />
            {cost && (
              <p className="mt-1 text-sm text-gray-600">
                ≈ {(parseInt(cost) / 100000000).toFixed(8)} BSV
              </p>
            )}
          </div>

          {/* Owner Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium mb-1">Owner Address:</p>
            <p className="text-xs text-gray-600 font-mono break-all">
              {identityKey || address || 'Not connected'}
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !file || !title || !cost}
            className="w-full"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </form>

        {/* Message Display */}
        {message && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-100 text-green-800'
                : messageType === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

