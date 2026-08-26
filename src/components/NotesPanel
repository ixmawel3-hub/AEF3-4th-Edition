import { useEffect, useRef } from 'react'
import { Box, IconButton, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

type NoteColor = {
  name: string
  value: string
}

export type Note = {
  id: string
  text: string
  color: string
  minimized: boolean
  position: { x: number; y: number }
  width?: number
  height?: number
}

type Props = {
  page: number
  note: Note
  minimizedIndex: number
  onChange: (note: Note) => void
  onDelete: () => void
}

export const defaultNoteColor = '#fff1b8'

export const noteColors: NoteColor[] = [
  { name: 'Pastel yellow', value: '#fff1b8' },
  { name: 'Pastel green', value: '#d9f7be' },
  { name: 'Pastel blue', value: '#cfe8ff' },
  { name: 'Pastel pink', value: '#f8d7e8' }
]

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max))

export default function NotesPanel({ page, note, minimizedIndex, onChange, onDelete }: Props) {
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null)
  const draggedRef = useRef(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || note.minimized) return

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.target.getBoundingClientRect()
      const nextWidth = Math.round(width)
      const nextHeight = Math.round(height)
      if (nextWidth === note.width && nextHeight === note.height) return
      onChange({ ...note, width: nextWidth, height: nextHeight })
    })
    resizeObserver.observe(panel)
    return () => resizeObserver.disconnect()
  }, [note, onChange])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    dragRef.current = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top }
    draggedRef.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (Math.abs(event.movementX) > 0 || Math.abs(event.movementY) > 0) draggedRef.current = true
    onChange({
      ...note,
      position: {
        x: clamp(event.clientX - dragRef.current.offsetX, 8, window.innerWidth - rect.width - 8),
        y: clamp(event.clientY - dragRef.current.offsetY, 8, window.innerHeight - rect.height - 8)
      }
    })
  }

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  if (note.minimized) {
    return (
      <Tooltip title="Expand note">
        <Paper
          elevation={6}
          onClick={() => onChange({ ...note, minimized: false })}
          role="button"
          aria-label={`Expand note for page ${page - 1}`}
          sx={{
            position: 'fixed',
            left: `calc(8px + ${minimizedIndex} * 72px)`,
            bottom: 8,
            zIndex: 30,
            width: 68,
            height: 32,
            bgcolor: note.color,
            border: '2px solid rgba(31, 41, 55, 0.25)',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer'
          }}
        />
      </Tooltip>
    )
  }

  return (
    <Paper
      ref={panelRef}
      elevation={8}
      sx={{
        position: 'fixed',
        left: note.position.x,
        top: note.position.y,
        zIndex: 30,
        width: note.width ?? 'min(300px, calc(100vw - 16px))',
        height: note.height ?? 'auto',
        minWidth: 220,
        minHeight: 120,
        maxWidth: 'calc(100vw - 16px)',
        maxHeight: 'calc(100vh - 16px)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        resize: 'both',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: note.color,
        border: '1px solid rgba(31, 41, 55, 0.14)',
        borderRadius: 2
      }}
    >
      <Box
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: 1,
          py: 0.5,
          cursor: 'grab',
          touchAction: 'none',
          userSelect: 'none',
          '&:active': { cursor: 'grabbing' }
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', minWidth: 0 }}>
          <DragIndicatorIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
          <Typography variant="subtitle2" noWrap>Notes - page {page - 1}</Typography>
        </Stack>
        <Stack direction="row" sx={{ flexShrink: 0 }} onPointerDown={(event) => event.stopPropagation()}>
          <Tooltip title="Minimize note">
            <IconButton size="small" onClick={() => onChange({ ...note, minimized: true })} aria-label="Minimize note">
              <KeyboardArrowDownIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete note">
            <IconButton size="small" onClick={onDelete} aria-label="Delete note"><DeleteIcon /></IconButton>
          </Tooltip>
        </Stack>
      </Box>
      {!note.minimized && (
        <Box sx={{ px: 1, pb: 1, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TextField
            multiline
            minRows={4}
            maxRows={10}
            fullWidth
            placeholder="Write a note for this page..."
            value={note.text}
            onChange={(event) => onChange({ ...note, text: event.target.value })}
            slotProps={{ htmlInput: { 'aria-label': `Notes for page ${page - 1}` } }}
            sx={{
              flex: 1,
              minHeight: 0,
              '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start', bgcolor: 'rgba(255, 255, 255, 0.48)' },
              '& textarea': { height: '100% !important', overflowY: 'auto !important' }
            }}
          />
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 0.75 }}>
            <Stack direction="row" spacing={0.5}>
              {noteColors.map((noteColor) => (
                <Tooltip key={noteColor.value} title={noteColor.name}>
                  <IconButton
                    size="small"
                    onClick={() => onChange({ ...note, color: noteColor.value })}
                    aria-label={noteColor.name}
                    sx={{
                      p: 0.5,
                      border: note.color === noteColor.value ? '2px solid' : '2px solid transparent',
                      borderColor: note.color === noteColor.value ? 'text.primary' : 'transparent'
                    }}
                  >
                    <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: noteColor.value, border: '1px solid rgba(31, 41, 55, 0.2)' }} />
                  </IconButton>
                </Tooltip>
              ))}
            </Stack>
          </Stack>
        </Box>
      )}
    </Paper>
  )
}
