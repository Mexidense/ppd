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
        
        // Redirect to published documents list
        setTimeout(() => {
          window.location.href = '/published'
        }, 1500)
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
    <Card className="border-2 shadow-lg">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6" aria-label="Upload document form">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs sm:text-sm font-medium mb-2">
              Title <span aria-label="required">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              placeholder="Enter document title"
              className="block w-full px-3 py-2 text-sm sm:text-base border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
              aria-required="true"
              aria-describedby="title-help"
            />
            <span id="title-help" className="sr-only">Enter a descriptive title for your document</span>
          </div>

          {/* File Upload - Enhanced */}
          <div>
            <label htmlFor="file-input" className="block text-xs sm:text-sm font-medium mb-2 sm:mb-3">
              PDF File <span aria-label="required">*</span>
            </label>
            
            {/* Custom File Upload Area */}
            <div className="relative">
              <input
                id="file-input"
                name="file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
                required
                aria-required="true"
                aria-describedby="file-help"
              />
              <label
                htmlFor="file-input"
                className={`flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                  file 
                    ? 'border-green-500 bg-green-500/10 hover:bg-green-500/20' 
                    : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={file ? `Selected file: ${file.name}. Click to change` : "Upload PDF file"}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2 px-4">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500" aria-hidden="true">
                      <FileCheck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 truncate max-w-full">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Click to change
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 px-4">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10" aria-hidden="true">
                      <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-medium text-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF files only (Max 50MB)
                      </p>
                    </div>
                  </div>
                )}
              </label>
              <span id="file-help" className="sr-only">Upload a PDF file, maximum size 50 megabytes</span>
            </div>
          </div>

          {/* Cost */}
          <div>
            <label htmlFor="cost" className="block text-xs sm:text-sm font-medium mb-2">
              Cost (Satoshis) <span aria-label="required">*</span>
            </label>
            <input
              id="cost"
              name="cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              disabled={loading}
              placeholder="1000"
              min="0"
              step="1"
              className="block w-full px-3 py-2 text-sm sm:text-base border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
              aria-required="true"
              aria-describedby="cost-help cost-conversion"
            />
            <span id="cost-help" className="sr-only">Enter the cost in satoshis for accessing this document</span>
            {cost && (
              <p id="cost-conversion" className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
                ≈ {(parseInt(cost) / 100000000).toFixed(8)} BSV
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-xs sm:text-sm font-medium mb-2">
              Tags (Optional)
            </label>
            
            {/* Tag Input Box with Selected Tags Inside */}
            <div 
              className="min-h-[60px] p-2 border border-input rounded-lg bg-gray-50 dark:bg-gray-800 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-ring"
              role="group"
              aria-label="Document tags"
            >
              {/* Selected Tags as Boxes with Different Colors */}
              <div className="flex flex-wrap gap-1.5 mb-2" role="list" aria-label="Selected tags">
                {selectedTags.map((tag, index) => (
                  <div
                    key={tag}
                    className={`inline-flex items-center gap-1 pl-2 pr-1 py-0.5 ${getTagColor(tag, index)} text-white rounded text-xs font-medium shadow-sm transition-all`}
                    role="listitem"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-white/25 rounded-full p-0.5 transition-colors"
                      disabled={loading}
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                
                {/* Inline Input */}
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  disabled={loading}
                  placeholder={selectedTags.length === 0 ? "Type a tag and press Enter..." : "Add another tag..."}
                  className="flex-1 min-w-[120px] px-2 py-1 bg-transparent border-none focus:outline-none text-xs dark:text-white"
                  aria-describedby="tags-help"
                />
              </div>
            </div>
            <span id="tags-help" className="sr-only">Type a tag name and press Enter to add it. Tags help categorize your document.</span>

            {/* Available Tags (Quick Select) */}
            {availableTags.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-2" id="suggested-tags-label">Suggested tags (click to add):</p>
                <div className="flex flex-wrap gap-1.5" role="list" aria-labelledby="suggested-tags-label">
                  {availableTags
                    .filter(tag => !selectedTags.includes(tag.name))
                    .slice(0, 10)
                    .map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleAddTag(tag.name)}
                        disabled={loading}
                        className="px-2 py-0.5 text-xs font-medium border border-input rounded hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors disabled:opacity-50"
                        aria-label={`Add tag ${tag.name}`}
                      >
                        {tag.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Owner Info */}
          <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-border" role="status" aria-label="Owner information">
            <p className="text-xs sm:text-sm font-medium mb-1 text-foreground">Owner Address:</p>
            <p className="text-xs text-muted-foreground font-mono break-all">
              {identityKey || address || 'Not connected'}
            </p>
          </div>

          {/* Submit Button - Enhanced UX */}
          <div className="pt-2 sm:pt-4">
            <Button
              type="submit"
              disabled={loading || !file || !title || !cost}
              className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={loading ? "Uploading document, please wait" : "Submit form to publish document"}
              aria-disabled={loading || !file || !title || !cost}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin" aria-hidden="true" />
                  <span>Uploading Document...</span>
                </>
              ) : file ? (
                <>
                  <FileCheck className="mr-2 h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  <span>Publish Document</span>
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  <span>Upload Document</span>
                </>
              )}
            </Button>
            
            {/* Helper Text with Icons */}
            <div className="mt-2 sm:mt-3 p-2 sm:p-3 rounded-lg bg-muted/30" role="status" aria-live="polite">
              <p className="text-xs text-center text-muted-foreground">
                {!file && !title && 'Please fill in all required fields to continue'}
                {file && title && cost && !loading && 'Ready to publish! Click the button above to upload'}
                {loading && 'Please wait while we upload your document...'}
              </p>
            </div>
          </div>
        </form>

        {/* Message Display */}
        {message && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : messageType === 'error'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            }`}
            role={messageType === 'error' ? 'alert' : 'status'}
            aria-live={messageType === 'error' ? 'assertive' : 'polite'}
          >
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

