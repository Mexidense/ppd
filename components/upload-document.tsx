'use client'

import { useState, useEffect } from 'react'
import { useWallet } from './wallet-provider'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { X, Upload, FileCheck, Loader2 } from 'lucide-react'

interface Tag {
  id: string
  name: string
}

export function UploadDocument() {
  const { address, identityKey, isConnected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  
  // Form state
  const [title, setTitle] = useState('')
  const [cost, setCost] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState('')

  // Fetch available tags on mount
  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      if (response.ok) {
        const data = await response.json()
        setAvailableTags(data.tags || [])
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleAddTag = (tagName: string) => {
    const trimmedName = tagName.trim().toLowerCase()
    if (!trimmedName) return

    // Check if tag already selected
    if (selectedTags.includes(trimmedName)) {
      showMessage('Tag already added', 'info')
      return
    }

    setSelectedTags([...selectedTags, trimmedName])
    setNewTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag(newTagInput)
    }
  }

  // Generate consistent color for each tag
  const getTagColor = (tag: string, index: number) => {
    const colors = [
      'bg-blue-500 hover:bg-blue-600',
      'bg-green-500 hover:bg-green-600',
      'bg-purple-500 hover:bg-purple-600',
      'bg-pink-500 hover:bg-pink-600',
      'bg-orange-500 hover:bg-orange-600',
      'bg-teal-500 hover:bg-teal-600',
      'bg-indigo-500 hover:bg-indigo-600',
      'bg-red-500 hover:bg-red-600',
      'bg-cyan-500 hover:bg-cyan-600',
      'bg-amber-500 hover:bg-amber-600',
    ]
    
    // Use index to cycle through colors
    return colors[index % colors.length]
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
      
      // Add tags as JSON string
      if (selectedTags.length > 0) {
        formData.append('tags', JSON.stringify(selectedTags))
      }

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
        setSelectedTags([])
        setNewTagInput('')
        
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
            />
          </div>

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
              className="block w-full text-sm text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-primary"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
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
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary dark:bg-gray-800 dark:text-white"
              required
            />
            {cost && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                ≈ {(parseInt(cost) / 100000000).toFixed(8)} BSV
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Tags (Optional)
            </label>
            
            {/* Tag Input Box with Selected Tags Inside */}
            <div className="min-h-[100px] p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              {/* Selected Tags as Boxes with Different Colors */}
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag, index) => (
                  <div
                    key={tag}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${getTagColor(tag, index)} text-white rounded-md text-sm font-medium shadow-sm transition-all`}
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-0.5 hover:bg-white/25 rounded-full p-0.5 transition-colors"
                      disabled={loading}
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                
                {/* Inline Input */}
                <input
                  id="tags"
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  disabled={loading}
                  placeholder={selectedTags.length === 0 ? "Type a tag and press Enter..." : "Add another tag..."}
                  className="flex-1 min-w-[150px] px-2 py-1 bg-transparent border-none focus:outline-none text-sm dark:text-white"
                />
              </div>
            </div>

            {/* Available Tags (Quick Select) */}
            {availableTags.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">Suggested tags (click to add):</p>
                <div className="flex flex-wrap gap-2">
                  {availableTags
                    .filter(tag => !selectedTags.includes(tag.name))
                    .slice(0, 10)
                    .map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleAddTag(tag.name)}
                        disabled={loading}
                        className="px-3 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors disabled:opacity-50"
                      >
                        {tag.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Owner Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium mb-1 text-foreground">Owner Address:</p>
            <p className="text-xs text-muted-foreground font-mono break-all">
              {identityKey || address || 'Not connected'}
            </p>
          </div>

          {/* Submit Button - Enhanced UX */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading || !file || !title || !cost}
              className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading Document...
                </>
              ) : file ? (
                <>
                  <FileCheck className="mr-2 h-5 w-5" />
                  Publish Document
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Document
                </>
              )}
            </Button>
            
            {/* Helper Text */}
            <p className="mt-2 text-xs text-center text-muted-foreground">
              {!file && !title && 'Please fill in all required fields'}
              {file && title && cost && !loading && 'Ready to publish! Click to upload your document'}
              {loading && 'Please wait while we upload your document...'}
            </p>
          </div>
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

