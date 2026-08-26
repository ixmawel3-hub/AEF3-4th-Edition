import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, AppBar, Box, Button, CircularProgress, IconButton, Stack, Toolbar, Tooltip, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import HomeIcon from '@mui/icons-material/Home'
import LogoutIcon from '@mui/icons-material/Logout'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import AudioPanel from './AudioPanel'
import Controls from './Controls'
import VideoPanel from './VideoPanel'
import NotesPanel from './NotesPanel'
import type { Note } from './NotesPanel'
import { defaultNoteColor } from './NotesPanel'
import type { BookUnit } from '../models/book'
import unitPages from '../data/unitPages.json'

// Resolve worker relative to the app base so it works on GitHub Pages
pdfjs.GlobalWorkerOptions.workerSrc = import.meta.env.BASE_URL + 'pdf.worker.min.mjs'

type Props = {
  src: string
  title?: string
  onClose?: () => void
  onLogoff?: () => void
}

export default function PdfViewer({ src, title, onClose, onLogoff }: Props) {
  const theme = useTheme()
  const compact = useMediaQuery(theme.breakpoints.down('sm'))
  const file = useMemo(() => ({ url: src }), [src])
  const [numPages, setNumPages] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [scale, setScale] = useState(1)
  const [pagesPerView, setPagesPerView] = useState<1 | 2>(1)
  const [audioOpen, setAudioOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [notesByPage, setNotesByPage] = useState<Record<number, Note[]>>({})
  const units = (unitPages as Record<string, BookUnit[]>)[title ?? ''] ?? []
  const [error, setError] = useState<string | null>(null)
  const [pageWidth, setPageWidth] = useState(0)
  const [pageRatio, setPageRatio] = useState(0.75)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const docAreaRef = useRef<HTMLDivElement | null>(null)
  const currentPageRef = useRef(1)
  const pageHistoryRef = useRef<number[]>([])
  const forwardPageHistoryRef = useRef<number[]>([])

  useEffect(() => {
    const measure = () => {
      const availableWidth = Math.max(0, (docAreaRef.current?.clientWidth ?? window.innerWidth) - (compact ? 16 : 32))
      const availableHeight = window.innerHeight - (compact ? 128 : 150)
      const widthPerPage = (availableWidth - (pagesPerView - 1) * 16) / pagesPerView
      const fitWidth = Math.min(widthPerPage, availableHeight * pageRatio)
      setPageWidth(Math.max(0, fitWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (docAreaRef.current) ro.observe(docAreaRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [compact, pageRatio, pagesPerView])

  useEffect(() => {
    if (compact) setPagesPerView(1)
  }, [compact])

  const onDocumentLoadSuccess = useCallback((doc: { numPages: number }) => {
    setNumPages(doc.numPages)
    currentPageRef.current = 1
    pageHistoryRef.current = []
    forwardPageHistoryRef.current = []
    setCanGoBack(false)
    setCanGoForward(false)
    setPage(1)
    setError(null)
  }, [])

  const onDocumentLoadError = useCallback((err: any) => {
    console.error('Document load error', err)
    setError(String(err?.message ?? err))
  }, [])
  const onDocumentSourceError = useCallback((err: any) => {
    console.error('Document source error', err)
    setError(String(err?.message ?? err))
  }, [])

  useEffect(() => {
    currentPageRef.current = 1
    pageHistoryRef.current = []
    forwardPageHistoryRef.current = []
    setPage(1)
    setScale(1)
    setNumPages(null)
    setNotesByPage({})
  }, [src])

  const changePage = (nextPage: number) => {
    if (nextPage === currentPageRef.current) return

    pageHistoryRef.current.push(currentPageRef.current)
    forwardPageHistoryRef.current = []
    currentPageRef.current = nextPage
    setPage(nextPage)
    setCanGoBack(true)
    setCanGoForward(false)
  }

  const goBack = () => {
    const previousPage = pageHistoryRef.current.pop()
    if (previousPage === undefined) return

    const currentPage = currentPageRef.current
    forwardPageHistoryRef.current.push(currentPage)
    currentPageRef.current = previousPage
    setPage(previousPage)
    setCanGoBack(pageHistoryRef.current.length > 0)
    setCanGoForward(true)
  }

  const goForward = () => {
    const nextPage = forwardPageHistoryRef.current.pop()
    if (nextPage === undefined) return

    const currentPage = currentPageRef.current
    pageHistoryRef.current.push(currentPage)
    currentPageRef.current = nextPage
    setPage(nextPage)
    setCanGoBack(true)
    setCanGoForward(forwardPageHistoryRef.current.length > 0)
  }

  const next = () => changePage(numPages ? Math.min(numPages, currentPageRef.current + pagesPerView) : currentPageRef.current + pagesPerView)
  const prev = () => changePage(Math.max(1, currentPageRef.current - pagesPerView))
  const zoomIn = () => setScale((s) => Math.min(3, s + 0.25))
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.25))
  const setPageSafe = (n: number) => {
    if (!numPages) return changePage(1)
    const v = Math.max(1, Math.min(numPages, Math.floor(n)))
    changePage(v)
  }

  const onPageLoadSuccess = (loadedPage: any) => {
    const viewport = loadedPage.getViewport({ scale: 1 })
    setPageRatio(viewport.width / viewport.height)
  }

  const toggleFull = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {})
    else document.exitFullscreen().catch(() => {})
  }

  return (
    <Box className="pdf-viewer" ref={containerRef} sx={{ minHeight: '100%', bgcolor: 'background.default', '&:fullscreen': { height: '100%', overflowY: 'auto' } }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ top: 0, borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar variant="dense" sx={{ minHeight: { xs: 48, sm: 56 }, px: { xs: 1, sm: 2 }, justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="h6" noWrap sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => onClose?.()} color="inherit" size="small"><Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Back to Bookshelf</Box></Button>
            <Tooltip title="Homepage"><IconButton component="a" href="https://ixmawel3-hub.github.io/EnglishBooks/" aria-label="Homepage" color="inherit" size="small"><HomeIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Logoff"><IconButton onClick={() => onLogoff?.()} aria-label="Logoff" color="inherit" size="small"><LogoutIcon fontSize="small" /></IconButton></Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>
      <Controls
        page={page}
        numPages={numPages}
        scale={scale}
        pagesPerView={pagesPerView}
        onNext={next}
        onPrev={prev}
        onBack={goBack}
        canGoBack={canGoBack}
        onForward={goForward}
        canGoForward={canGoForward}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onSetPage={setPageSafe}
        units={units}
        onSelectUnit={setPageSafe}
        onPagesPerViewChange={setPagesPerView}
        onToggleAudio={() => {
          setAudioOpen((isOpen) => !isOpen)
          setVideoOpen(false)
        }}
        audioOpen={audioOpen}
        onToggleVideo={() => {
          setVideoOpen((isOpen) => !isOpen)
          setAudioOpen(false)
        }}
        videoOpen={videoOpen}
        onToggleNotes={() => {
          const pageNotes = notesByPage[page] ?? []
          setNotesByPage((notes) => ({
            ...notes,
            [page]: [...pageNotes, {
              id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
              text: '',
              color: defaultNoteColor,
              minimized: false,
              position: { x: 24 + pageNotes.length * 20, y: 120 + pageNotes.length * 28 }
            }]
          }))
        }}
        notesOpen={(notesByPage[page]?.length ?? 0) > 0}
        compact={compact}
        onToggleFull={toggleFull}
      />

      <Box className="viewer-content">
        <Box className="document-area" ref={docAreaRef} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', p: { xs: 1, sm: 2 }, overflowX: 'auto', bgcolor: 'grey.100' }}>
          {error ? (
            <Alert severity="error">Erro ao carregar PDF: {error}</Alert>
          ) : (
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                onSourceError={onDocumentSourceError}
                loading={<CircularProgress />}>
                <Box className={pagesPerView === 2 ? 'page-spread' : undefined} sx={pagesPerView === 2 ? { display: 'flex', alignItems: 'flex-start', gap: 2 } : undefined}>
                  <Page
                    pageNumber={page}
                    width={pageWidth > 0 ? pageWidth * scale : undefined}
                    onLoadSuccess={onPageLoadSuccess}
                  />
                  {pagesPerView === 2 && numPages !== null && page < numPages && (
                    <Page
                      pageNumber={page + 1}
                      width={pageWidth > 0 ? pageWidth * scale : undefined}
                    />
                  )}
                </Box>
              </Document>
          )}
        </Box>
        {audioOpen && <AudioPanel bookTitle={title ?? ''} onClose={() => setAudioOpen(false)} />}
        {videoOpen && <VideoPanel bookTitle={title ?? ''} onClose={() => setVideoOpen(false)} />}
        {(notesByPage[page] ?? []).map((note) => (
          <NotesPanel
            key={note.id}
            page={page}
            note={note}
            minimizedIndex={(notesByPage[page] ?? []).filter((currentNote) => currentNote.minimized).findIndex((currentNote) => currentNote.id === note.id)}
            onChange={(updatedNote) => setNotesByPage((notes) => ({
              ...notes,
              [page]: (notes[page] ?? []).map((currentNote) => currentNote.id === updatedNote.id ? updatedNote : currentNote)
            }))}
            onDelete={() => setNotesByPage((notes) => ({
              ...notes,
              [page]: (notes[page] ?? []).filter((currentNote) => currentNote.id !== note.id)
            }))}
          />
        ))}
      </Box>
    </Box>
  )
}
