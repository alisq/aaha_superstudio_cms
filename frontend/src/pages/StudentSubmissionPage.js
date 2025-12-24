import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { API_URL } from '../config'
import './StudentSubmissionPage.css'

const SESSION_STORAGE_KEY = 'superstudio-submission-session'

// Predefined tags (matching project schema)
const PREDEFINED_TAGS = [
  'Community land trusts',
  'Cooperative housing',
  'Decolonization',
  'Financialization',
  'Housing design',
  'Housing policy',
  'Housing theory',
  'Indigeneity',
  'Pedagogy',
]

// Convert Sanity block content to HTML for Quill
const blocksToHtml = (blocks) => {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return ''
  }

  let html = ''
  let currentList = null
  let currentListType = null

  blocks.forEach((block, index) => {
    if (block._type !== 'block') {
      return
    }

    const style = block.style || 'normal'
    const children = block.children || []
    const listItem = block.listItem

    // Process children to apply marks
    const processChildren = (childrenArray, blockMarkDefs = []) => {
      return childrenArray
        .map((child) => {
          if (child._type !== 'span') {
            return ''
          }

          let content = escapeHtml(child.text || '')
          const marks = child.marks || []

          if (marks.length === 0) {
            return content
          }

          // Separate link marks from text formatting marks
          const linkMarks = []
          const textMarks = []

          marks.forEach((mark) => {
            if (typeof mark === 'string') {
              if (mark === 'strong' || mark === 'em' || mark === 'underline') {
                textMarks.push(mark)
              } else if (mark.startsWith('link-')) {
                linkMarks.push(mark)
              }
            }
          })

          // Apply text formatting marks first (bold, italic, underline)
          textMarks.forEach((mark) => {
            if (mark === 'strong') {
              content = `<strong>${content}</strong>`
            } else if (mark === 'em') {
              content = `<em>${content}</em>`
            } else if (mark === 'underline') {
              content = `<u>${content}</u>`
            }
          })

          // Apply link marks last (outermost)
          linkMarks.forEach((markKey) => {
            const linkDef = blockMarkDefs.find((def) => def._key === markKey)
            if (linkDef && linkDef.href) {
              content = `<a href="${escapeHtml(linkDef.href)}">${content}</a>`
            }
          })

          return content
        })
        .join('')
    }

    const markDefs = block.markDefs || []
    const text = processChildren(children, markDefs)

    // Handle lists
    if (listItem) {
      if (currentListType !== listItem) {
        // Close previous list if different type
        if (currentList !== null) {
          html += currentListType === 'bullet' ? '</ul>' : '</ol>'
        }
        // Start new list
        currentListType = listItem
        html += listItem === 'bullet' ? '<ul>' : '<ol>'
        currentList = true
      }
      html += `<li>${text}</li>`
    } else {
      // Close any open list
      if (currentList !== null) {
        html += currentListType === 'bullet' ? '</ul>' : '</ol>'
        currentList = null
        currentListType = null
      }

      // Add block based on style
      if (style === 'h2') {
        html += `<h2>${text}</h2>`
      } else if (style === 'h3') {
        html += `<h3>${text}</h3>`
      } else if (style === 'blockquote') {
        html += `<blockquote>${text}</blockquote>`
      } else {
        html += `<p>${text}</p>`
      }
    }
  })

  // Close any remaining open list
  if (currentList !== null) {
    html += currentListType === 'bullet' ? '</ul>' : '</ol>'
  }

  return html
}

// Convert HTML from Quill to Sanity block content
const htmlToBlocks = (html) => {
  if (!html || typeof html !== 'string' || html.trim() === '') {
    return []
  }

  // Strip Quill's placeholder content
  const cleanHtml = html.replace(/<p><br><\/p>/g, '').trim()
  if (!cleanHtml) {
    return []
  }

  // Create a temporary DOM element to parse HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(cleanHtml, 'text/html')
  const body = doc.body

  const blocks = []
  const allMarkDefs = []

  // Generate unique key
  const genKey = () => Math.random().toString(36).substr(2, 9)

  // Process inline content (text with marks)
  const processInlineContent = (node, inheritedMarks = []) => {
    const spans = []

    const walk = (n, marks) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const text = n.textContent || ''
        if (text) {
          spans.push({
            _type: 'span',
            _key: `span-${genKey()}`,
            text: text,
            marks: marks.length > 0 ? [...marks] : [],
          })
        }
        return
      }

      if (n.nodeType !== Node.ELEMENT_NODE) {
        return
      }

      const tag = n.tagName.toLowerCase()

      // Handle <br> tags as line breaks (convert to space for now)
      if (tag === 'br') {
        spans.push({
          _type: 'span',
          _key: `span-${genKey()}`,
          text: '\n',
          marks: marks.length > 0 ? [...marks] : [],
        })
        return
      }

      const newMarks = [...marks]

      if (tag === 'strong' || tag === 'b') {
        newMarks.push('strong')
      } else if (tag === 'em' || tag === 'i') {
        newMarks.push('em')
      } else if (tag === 'u') {
        newMarks.push('underline')
      } else if (tag === 'a') {
        const href = n.getAttribute('href') || '#'
        const linkKey = `link-${genKey()}`
        allMarkDefs.push({
          _type: 'link',
          _key: linkKey,
          href: href,
        })
        newMarks.push(linkKey)
      }

      Array.from(n.childNodes).forEach((child) => walk(child, newMarks))
    }

    walk(node, inheritedMarks)
    return spans
  }

  // Process block-level elements
  Array.from(body.childNodes).forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return
    }

    const tag = node.tagName.toLowerCase()
    const children = processInlineContent(node)

    if (children.length === 0) {
      return
    }

    if (tag === 'h2') {
      blocks.push({
        _type: 'block',
        _key: `block-${genKey()}`,
        style: 'h2',
        children: children,
        markDefs: [],
      })
    } else if (tag === 'h3') {
      blocks.push({
        _type: 'block',
        _key: `block-${genKey()}`,
        style: 'h3',
        children: children,
        markDefs: [],
      })
    } else if (tag === 'blockquote') {
      blocks.push({
        _type: 'block',
        _key: `block-${genKey()}`,
        style: 'blockquote',
        children: children,
        markDefs: [],
      })
    } else if (tag === 'ul') {
      // Process list items
      Array.from(node.querySelectorAll(':scope > li')).forEach((li) => {
        const liChildren = processInlineContent(li)
        if (liChildren.length > 0) {
          blocks.push({
            _type: 'block',
            _key: `block-${genKey()}`,
            style: 'normal',
            listItem: 'bullet',
            children: liChildren,
            markDefs: [],
          })
        }
      })
    } else if (tag === 'ol') {
      // Process list items
      Array.from(node.querySelectorAll(':scope > li')).forEach((li) => {
        const liChildren = processInlineContent(li)
        if (liChildren.length > 0) {
          blocks.push({
            _type: 'block',
            _key: `block-${genKey()}`,
            style: 'normal',
            listItem: 'number',
            children: liChildren,
            markDefs: [],
          })
        }
      })
    } else if (tag === 'p' || tag === 'div') {
      // Only add block if it has content (filter out empty paragraphs)
      if (children.length > 0) {
        blocks.push({
          _type: 'block',
          _key: `block-${genKey()}`,
          style: 'normal',
          children: children,
          markDefs: [],
        })
      }
    }
  })

  // Add markDefs to blocks that reference them
  if (allMarkDefs.length > 0) {
    blocks.forEach((block) => {
      const blockMarkDefs = []
      block.children.forEach((child) => {
        if (child.marks) {
          child.marks.forEach((mark) => {
            if (typeof mark === 'string' && mark.startsWith('link-')) {
              const def = allMarkDefs.find((d) => d._key === mark)
              if (def && !blockMarkDefs.find((d) => d._key === mark)) {
                blockMarkDefs.push(def)
              }
            }
          })
        }
      })
      if (blockMarkDefs.length > 0) {
        block.markDefs = blockMarkDefs
      }
    })
  }

  return blocks
}

// Helper to escape HTML
const escapeHtml = (text) => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const getStoredSession = () => {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch (error) {
    console.warn('Failed to parse stored submission session', error)
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

// Global map to track initialized Quill editors by DOM element
const quillInstances = new WeakMap()

// Custom Quill Editor Component (React 19 compatible)
const QuillEditor = ({ value, onChange, placeholder, modules, formats }) => {
  const editorRef = useRef(null)
  const quillInstanceRef = useRef(null)
  const isInternalChangeRef = useRef(false)
  const onChangeRef = useRef(onChange)

  // Keep onChange ref up to date
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const editorElement = editorRef.current
    if (!editorElement) return

    // Check if this element already has a Quill instance
    const existingInstance = quillInstances.get(editorElement)
    if (existingInstance) {
      quillInstanceRef.current = existingInstance
      return
    }

    // Check if Quill structure already exists (toolbar + container)
    const children = Array.from(editorElement.children)
    const hasToolbar = children.some(child => child.classList.contains('ql-toolbar'))
    const hasContainer = children.some(child => child.classList.contains('ql-container'))
    
    if (hasToolbar && hasContainer) {
      // Quill is already initialized - get instance from container
      const container = children.find(child => child.classList.contains('ql-container'))
      if (container && container.__quill) {
        quillInstanceRef.current = container.__quill
        quillInstances.set(editorElement, container.__quill)
        return
      }
    }

    // Clear the element for fresh initialization
    editorElement.innerHTML = ''

    // Initialize Quill - it will create toolbar and container inside editorElement
    const quill = new Quill(editorElement, {
      theme: 'snow',
      modules: modules || {
        toolbar: [
          [{ header: [2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'link'],
          ['clean'],
        ],
      },
      formats: formats || ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'blockquote', 'link'],
      placeholder: placeholder || '',
    })

    quillInstanceRef.current = quill
    quillInstances.set(editorElement, quill)

    // Set initial value
    if (value) {
      const delta = quill.clipboard.convert({ html: value })
      quill.setContents(delta, 'silent')
    }

    // Handle text changes from user input
    const handleTextChange = () => {
      if (isInternalChangeRef.current) {
        isInternalChangeRef.current = false
        return
      }

      const html = quill.root.innerHTML
      // Quill sometimes outputs <p><br></p> for empty content
      const cleanHtml = html === '<p><br></p>' ? '' : html
      if (onChangeRef.current) {
        onChangeRef.current(cleanHtml)
      }
    }

    quill.on('text-change', handleTextChange)

    return () => {
      // Cleanup: remove event listener
      if (quillInstanceRef.current) {
        quillInstanceRef.current.off('text-change', handleTextChange)
      }
      // Note: We don't remove from WeakMap or destroy Quill instance
      // because React StrictMode will remount immediately
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount - modules/formats/placeholder should be stable props

  // Update content when value prop changes (from external source)
  useEffect(() => {
    if (!quillInstanceRef.current) return

    const currentHtml = quillInstanceRef.current.root.innerHTML
    // Normalize both values for comparison (handle <p><br></p> as empty)
    const normalizedCurrent = currentHtml === '<p><br></p>' ? '' : currentHtml
    const normalizedValue = value === '<p><br></p>' ? '' : (value || '')

    if (normalizedCurrent !== normalizedValue) {
      isInternalChangeRef.current = true
      const delta = quillInstanceRef.current.clipboard.convert({ html: value || '' })
      quillInstanceRef.current.setContents(delta, 'silent')
    }
  }, [value])

  return <div ref={editorRef} className="quill-editor" data-quill-editor="true" />
}

const StudentSubmissionPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [session, setSession] = useState(getStoredSession)
  const [submission, setSubmission] = useState(null)
  const [emailInput, setEmailInput] = useState('')
  const [loginMessage, setLoginMessage] = useState(null)
  const [loginError, setLoginError] = useState(null)
  const [devLink, setDevLink] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [saveState, setSaveState] = useState('idle')
  const [saveError, setSaveError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingPoster, setUploadingPoster] = useState(false)
  const [submissionError, setSubmissionError] = useState(null)
  const [studios, setStudios] = useState([])
  const [studiosLoading, setStudiosLoading] = useState(true)
  const [studiosError, setStudiosError] = useState(null)
  const [descriptionHtml, setDescriptionHtml] = useState('')

  const sessionToken = session?.sessionToken || session?.token || session?.session_token

  // Form state derived from submission
  const formState = useMemo(() => {
    if (!submission) {
      return {
        title: '',
        description: [],
        poster_image: null,
        allTags: [],
        allStudents: [],
        home_studio: null,
        media: [],
      }
    }

    return {
      title: submission.title || '',
      description: submission.description || [],
      poster_image: submission.poster_image || null,
      allTags: submission.allTags || [],
      allStudents: submission.allStudents || [],
      home_studio: submission.home_studio || null,
      media: submission.media || [],
    }
  }, [submission])

  // Update description HTML when submission changes
  useEffect(() => {
    if (submission?.description) {
      const html = blocksToHtml(submission.description)
      setDescriptionHtml(html)
    } else {
      setDescriptionHtml('')
    }
  }, [submission?.description])

  // Fetch studios on mount (fetch regardless of login status)
  useEffect(() => {
    const fetchStudios = async () => {
      setStudiosLoading(true)
      setStudiosError(null)
      try {
        const response = await fetch(`${API_URL}/api/studios`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.message || `HTTP ${response.status}`
          console.error('Failed to fetch studios:', response.status, errorData)
          setStudiosError(errorMessage)
          setStudios([])
          return
        }
        const data = await response.json()
        if (Array.isArray(data)) {
          setStudios(data)
          console.log(`Loaded ${data.length} studios`)
          if (data.length === 0) {
            console.warn('No studios found in the database')
          }
        } else {
          console.error('Studios data is not an array:', data)
          setStudiosError('Invalid response format')
          setStudios([])
        }
      } catch (error) {
        console.error('Failed to fetch studios:', error)
        setStudiosError(error.message || 'Failed to load studios')
        setStudios([])
      } finally {
        setStudiosLoading(false)
      }
    }
    fetchStudios()
  }, [])

  const persistSession = useCallback((nextSession) => {
    if (nextSession) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession))
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    }
    setSession(nextSession)
  }, [])

  const removeTokenFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search)
    if (params.has('token')) {
      params.delete('token')
      navigate(
        {
          pathname: '/submit',
          search: params.toString() ? `?${params.toString()}` : '',
        },
        { replace: true },
      )
    }
  }, [location.search, navigate])

  const applySubmission = useCallback((doc) => {
    if (!doc) {
      setSubmission(null)
      return
    }
    setSubmission(doc)
  }, [])

  const fetchSubmission = useCallback(
    async (token) => {
      try {
        setSubmissionError(null)
        const response = await fetch(`${API_URL}/api/submissions/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 401) {
          persistSession(null)
          throw new Error('Your session has expired. Request a new magic link.')
        }

        if (!response.ok) {
          throw new Error('Unable to load submission')
        }

        const doc = await response.json()
        applySubmission(doc)
      } catch (error) {
        console.error('Failed to fetch submission', error)
        setSubmissionError(error.message)
      } finally {
        setInitialized(true)
      }
    },
    [applySubmission, persistSession],
  )

  const verifyMagicLink = useCallback(
    async (magicToken) => {
      setVerifying(true)
      setLoginError(null)
      setLoginMessage(null)
      try {
        const response = await fetch(`${API_URL}/api/auth/verify-magic-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: magicToken }),
        })

        if (!response.ok) {
          throw new Error('Magic link is invalid or has expired. Request a new link.')
        }

        const data = await response.json()
        const nextSession = {
          sessionToken: data.sessionToken,
          email: data.email,
          submissionId: data.submissionId,
        }
        persistSession(nextSession)
        applySubmission(data.submission)
        removeTokenFromUrl()
        setLoginMessage('You are signed in. Continue editing your submission below.')
        setLoginError(null)
      } catch (error) {
        console.error('Failed to verify magic link', error)
        setLoginError(error.message)
      } finally {
        setVerifying(false)
        setInitialized(true)
      }
    },
    [applySubmission, persistSession, removeTokenFromUrl],
  )

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const magicToken = params.get('token')

    if (magicToken) {
      verifyMagicLink(magicToken)
      return
    }

    if (sessionToken) {
      fetchSubmission(sessionToken)
      return
    }

    setInitialized(true)
  }, [fetchSubmission, location.search, sessionToken, verifyMagicLink])

  const handleMagicLinkRequest = async (event) => {
    event.preventDefault()
    setLoginError(null)
    setLoginMessage(null)
    setDevLink(null)

    const email = emailInput.trim().toLowerCase()
    if (!email) {
      setLoginError('Enter an email address to receive a magic link.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/request-magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.message || 'Unable to send magic link. Please try again.')
      }

      if (result.loginUrl) {
        setLoginMessage(
          'Magic link generated! Click the link below to sign in. (If email sending failed, check the server console for the link.)',
        )
        setDevLink(result.loginUrl)
      } else {
        setLoginMessage('Check your inbox for the magic link. It expires in 15 minutes.')
      }
    } catch (error) {
      console.error('Failed to send magic link', error)
      setLoginError(error.message)
    }
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (!sessionToken) return

    setSaveState('saving')
    setSaveError(null)

    try {
      // Convert description HTML to blocks
      const descriptionBlocks = htmlToBlocks(descriptionHtml)
      
      // Validate description has content (check if any block has text)
      const hasContent = descriptionBlocks.some((block) => {
        if (block.children && Array.isArray(block.children)) {
          return block.children.some((child) => {
            return child.text && child.text.trim().length > 0
          })
        }
        return false
      })
      
      if (!hasContent) {
        setSaveError('Description is required. Please add some content.')
        setSaveState('error')
        return
      }

      const response = await fetch(`${API_URL}/api/submissions/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          title: formState.title,
          description: descriptionBlocks,
          poster_image: formState.poster_image,
          allTags: formState.allTags,
          allStudents: formState.allStudents,
          home_studio: formState.home_studio,
          media: formState.media,
        }),
      })

      if (response.status === 401) {
        persistSession(null)
        throw new Error('Your session expired. Request a new magic link.')
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Unable to save submission. Please try again.')
      }

      const updated = await response.json()
      applySubmission(updated)
      setSaveState('saved')
    } catch (error) {
      console.error('Failed to save submission', error)
      setSaveError(error.message)
      setSaveState('error')
    } finally {
      setTimeout(() => setSaveState('idle'), 4000)
    }
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setSubmission((prev) => ({
      ...(prev || {}),
      [name]: value,
    }))
  }

  const handleDescriptionChange = (html) => {
    setDescriptionHtml(html)
  }

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ header: [2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'link'],
      ['clean'],
    ],
  }

  const quillFormats = ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'blockquote', 'link']

  const handlePosterImageUpload = async (event) => {
    if (!sessionToken) return
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingPoster(true)
    setSaveError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}/api/submissions/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        body: formData,
      })

      if (response.status === 401) {
        persistSession(null)
        throw new Error('Your session expired. Request a new magic link.')
      }

      if (!response.ok) {
        throw new Error(`Failed to upload poster image`)
      }

      const result = await response.json()
      setSubmission((prev) => ({
        ...prev,
        poster_image: {
          ...result.image,
          url: result.url,
        },
      }))
    } catch (error) {
      console.error('Failed to upload poster image', error)
      setSaveError(error.message)
    } finally {
      setUploadingPoster(false)
      event.target.value = ''
    }
  }

  const handleTagToggle = (tag) => {
    setSubmission((prev) => {
      const currentTags = prev?.allTags || []
      const isSelected = currentTags.includes(tag)
      return {
        ...prev,
        allTags: isSelected
          ? currentTags.filter((t) => t !== tag)
          : [...currentTags, tag],
      }
    })
  }

  const handleStudioChange = (event) => {
    const studioId = event.target.value
    setSubmission((prev) => ({
      ...prev,
      home_studio: studioId
        ? {
            _id: studioId,
            _type: 'reference',
          }
        : null,
    }))
  }

  const handleStudentAdd = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const value = event.target.value.trim()
      if (value) {
        setSubmission((prev) => {
          const currentStudents = prev?.allStudents || []
          // For tags field, we need to preserve the structure
          // Simple implementation: treat as array of strings for now
          const studentsArray = Array.isArray(currentStudents)
            ? currentStudents
            : currentStudents?.map
            ? currentStudents.map((s) => (typeof s === 'string' ? s : s.value || s.label))
            : []
          if (!studentsArray.includes(value)) {
            return {
              ...prev,
              allStudents: [...studentsArray, value],
            }
          }
          return prev
        })
        event.target.value = ''
      }
    }
  }

  const handleStudentRemove = (student) => {
    setSubmission((prev) => {
      const currentStudents = prev?.allStudents || []
      const studentsArray = Array.isArray(currentStudents)
        ? currentStudents
        : currentStudents?.map
        ? currentStudents.map((s) => (typeof s === 'string' ? s : s.value || s.label))
        : []
      return {
        ...prev,
        allStudents: studentsArray.filter((s) => s !== student),
      }
    })
  }

  const handleMediaUpload = async (event) => {
    if (!sessionToken) return
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    setUploading(true)
    setSaveError(null)

    try {
      const uploadedMedia = []
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${API_URL}/api/submissions/upload-image`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
          body: formData,
        })

        if (response.status === 401) {
          persistSession(null)
          throw new Error('Your session expired. Request a new magic link.')
        }

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const result = await response.json()
        uploadedMedia.push({
          _type: 'image',
          ...result.image,
          url: result.url,
          caption: '',
        })
      }

      setSubmission((prev) => ({
        ...prev,
        media: [...(prev?.media || []), ...uploadedMedia],
      }))
    } catch (error) {
      console.error('Failed to upload media', error)
      setSaveError(error.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleMediaCaptionChange = (index, caption) => {
    setSubmission((prev) => {
      const media = [...(prev?.media || [])]
      media[index] = {
        ...media[index],
        caption,
      }
      return {
        ...prev,
        media,
      }
    })
  }

  const handleMediaRemove = (index) => {
    setSubmission((prev) => {
      const media = [...(prev?.media || [])]
      media.splice(index, 1)
      return {
        ...prev,
        media,
      }
    })
  }

  const handleVideoAdd = () => {
    const url = prompt('Enter video URL:')
    if (url && url.trim()) {
      setSubmission((prev) => ({
        ...prev,
        media: [
          ...(prev?.media || []),
          {
            _type: 'video',
            video_url: url.trim(),
            caption: '',
          },
        ],
      }))
    }
  }

  const handleLogout = () => {
    persistSession(null)
    setSubmission(null)
    setLoginMessage('You have been signed out.')
  }

  if (!initialized || verifying) {
    return (
      <div className="submission-layout">
        <div className="submission-card">
          <h1>Student submission</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!sessionToken) {
    return (
      <div className="submission-layout">
        <div className="submission-card">
          <h1>Student submission</h1>
          <p className="support-copy">
            Enter the email address tied to your studio project. We&apos;ll send you a magic link to
            keep editing your submission.
          </p>
          <form className="submission-form" onSubmit={handleMagicLinkRequest}>
            <label htmlFor="student-email">Email address</label>
            <input
              id="student-email"
              type="email"
              autoComplete="email"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              placeholder="your.name@school.edu"
              required
            />
            <button type="submit">Send magic link</button>
          </form>
          {loginMessage && <p className="status success">{loginMessage}</p>}
          {loginError && <p className="status error">{loginError}</p>}
          {devLink && (
            <p className="status debug">
              Development shortcut:{' '}
              <a href={devLink} rel="noreferrer">
                open magic link
              </a>
            </p>
          )}
        </div>
      </div>
    )
  }

  const studentsArray = Array.isArray(formState.allStudents)
    ? formState.allStudents
    : formState.allStudents?.map
    ? formState.allStudents.map((s) => (typeof s === 'string' ? s : s.value || s.label))
    : []

  return (
    <div className="submission-layout">
      <div className="submission-card">
        <div className="card-header">
          <div>
            <h1>Student submission</h1>
            <p className="support-copy">
              Signed in as <strong>{session?.email}</strong>
            </p>
          </div>
          <button className="secondary" type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>

        {submissionError && <p className="status error">{submissionError}</p>}
        {saveError && <p className="status error">{saveError}</p>}
        {saveState === 'saved' && <p className="status success">Submission saved.</p>}
        {saveState === 'saving' && <p className="status info">Saving…</p>}
        {loginMessage && <p className="status info">{loginMessage}</p>}

        <form className="submission-form" onSubmit={handleSave}>
          <label htmlFor="submission-title">Project title *</label>
          <input
            id="submission-title"
            name="title"
            type="text"
            value={formState.title}
            onChange={handleInputChange}
            placeholder="Give your project a clear title"
            required
          />

          <label htmlFor="submission-poster">Poster image *</label>
          <input
            id="submission-poster"
            type="file"
            accept="image/*"
            onChange={handlePosterImageUpload}
            disabled={uploadingPoster}
          />
          {uploadingPoster && <p className="status info">Uploading poster image…</p>}
          {formState.poster_image?.url && (
            <div className="poster-preview">
              <img src={formState.poster_image.url} alt={formState.poster_image.alt || 'Poster'} />
              {formState.poster_image.alt && <p className="image-alt">Alt: {formState.poster_image.alt}</p>}
            </div>
          )}

          <label htmlFor="submission-studio">Home studio</label>
          {studiosLoading ? (
            <p className="status info">Loading studios...</p>
          ) : studiosError ? (
            <p className="status error">Error loading studios: {studiosError}</p>
          ) : (
            <select
              id="submission-studio"
              value={formState.home_studio?._id || ''}
              onChange={handleStudioChange}
            >
              <option value="">Select a studio</option>
              {studios.length === 0 ? (
                <option value="" disabled>
                  No studios available
                </option>
              ) : (
                studios.map((studio) => (
                  <option key={studio._id} value={studio._id}>
                    {studio.title}
                    {studio.institution ? ` - ${studio.institution.title}` : ''}
                  </option>
                ))
              )}
            </select>
          )}

          <label>Tags *</label>
          <div className="tags-container">
            {PREDEFINED_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`tag-chip ${formState.allTags.includes(tag) ? 'selected' : ''}`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <label htmlFor="submission-students">Students</label>
          <input
            id="submission-students"
            type="text"
            placeholder="Enter student name and press Enter"
            onKeyPress={handleStudentAdd}
          />
          {studentsArray.length > 0 && (
            <div className="students-list">
              {studentsArray.map((student, index) => (
                <span key={index} className="student-tag">
                  {student}
                  <button
                    type="button"
                    onClick={() => handleStudentRemove(student)}
                    className="remove-student"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <label htmlFor="submission-description">Description *</label>
          <div className="quill-editor-wrapper">
            <QuillEditor
              value={descriptionHtml}
              onChange={handleDescriptionChange}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Share an overview of the project, collaborators, and key ideas."
            />
          </div>

          <label>Media (images and videos)</label>
          <div className="media-actions">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMediaUpload}
              disabled={uploading}
            />
            <button type="button" onClick={handleVideoAdd} className="secondary">
              Add video URL
            </button>
          </div>
          {uploading && <p className="status info">Uploading media…</p>}

          <div className="media-grid">
            {(formState.media || []).map((item, index) => (
              <div className="media-card" key={item.asset?._ref || item.video_url || index}>
                {item._type === 'image' && item.url && (
                  <>
                    <img src={item.url} alt={item.caption || 'Media'} />
                    <input
                      type="text"
                      value={item.caption || ''}
                      placeholder="Add a caption"
                      onChange={(event) => handleMediaCaptionChange(index, event.target.value)}
                    />
                  </>
                )}
                {item._type === 'video' && item.video_url && (
                  <>
                    <div className="video-preview">
                      <a href={item.video_url} target="_blank" rel="noopener noreferrer">
                        {item.video_url}
                      </a>
                    </div>
                    <input
                      type="text"
                      value={item.caption || ''}
                      placeholder="Add a caption"
                      onChange={(event) => handleMediaCaptionChange(index, event.target.value)}
                    />
                  </>
                )}
                <button
                  type="button"
                  className="danger"
                  onClick={() => handleMediaRemove(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="actions">
            <button type="submit" className="primary" disabled={saveState === 'saving'}>
              {saveState === 'saving' ? 'Saving…' : 'Save submission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentSubmissionPage
