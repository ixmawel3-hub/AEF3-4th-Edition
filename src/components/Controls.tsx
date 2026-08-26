import { useRef } from 'react'
import { FormControl, IconButton, InputAdornment, MenuItem, Select, Stack, TextField, Tooltip, Typography } from '@mui/material'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'
import VideocamIcon from '@mui/icons-material/Videocam'
import StickyNote2Icon from '@mui/icons-material/StickyNote2'
import ArticleIcon from '@mui/icons-material/Article'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import type { BookUnit } from '../models/book'
type Props = {
  page: number
  numPages: number | null
  scale: number
  pagesPerView: 1 | 2
  onNext: () => void
  onPrev: () => void
  onBack: () => void
  canGoBack: boolean
  onForward: () => void
  canGoForward: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onSetPage: (n: number) => void
  units: BookUnit[]
  onSelectUnit: (page: number) => void
  onPagesPerViewChange: (pages: 1 | 2) => void
  onToggleAudio: () => void
  audioOpen: boolean
  onToggleVideo: () => void
  videoOpen: boolean
  onToggleNotes: () => void
  notesOpen: boolean
  compact: boolean
  onToggleFull: () => void
}

export default function Controls({
  page,
  numPages,
  scale,
  pagesPerView,
  onNext,
  onPrev,
  onBack,
  canGoBack,
  onForward,
  canGoForward,
  onZoomIn,
  onZoomOut,
  onSetPage,
  units,
  onSelectUnit,
  onPagesPerViewChange,
  onToggleAudio,
  audioOpen,
  onToggleVideo,
  videoOpen,
  onToggleNotes,
  notesOpen,
  compact,
  onToggleFull
}: Props) {
  const currentUnit = units.reduce<BookUnit | null>((activeUnit, unit) => (
    unit.page <= page ? unit : activeUnit
  ), null)
  const pageInputRef = useRef<HTMLInputElement | null>(null)

  const applyTypedPage = () => {
    const value = pageInputRef.current?.value.trim() ?? ''
    if (value === '') {
      onSetPage(1)
      return
    }

    const selectedPage = Number(value)
    if (Number.isInteger(selectedPage)) onSetPage(selectedPage + 1)
  }

  return (
    <Stack sx={{
      alignItems: 'stretch',
      gap: 0.5,
      p: 1,
      overflowX: 'hidden',
      borderBottom: 1,
      borderColor: 'divider',
      bgcolor: 'background.paper',
      position: 'sticky',
      top: 49,
      zIndex: 10,
      scrollbarWidth: 'thin',
      display: { xs: 'flex', sm: 'grid', md: 'flex' },
      flexDirection: { xs: 'column', md: 'row' },
      gridTemplateColumns: { sm: 'minmax(0, 1fr) minmax(150px, 220px) auto' },
      gridTemplateAreas: { sm: '"navigation unit zoom" "actions actions actions"' }
    }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: { xs: 0, sm: 0.25 }, width: { xs: '100%', md: 'auto' }, minWidth: 0, flexShrink: 0, gridArea: { sm: 'navigation' } }}>
        <Tooltip title="Back in page history"><span><IconButton sx={{ p: { xs: 0.5, sm: 0.5, md: 1 } }} onClick={onBack} disabled={!canGoBack} aria-label="Back in page history"><UndoIcon /></IconButton></span></Tooltip>
        <Tooltip title="Forward in page history"><span><IconButton sx={{ p: { xs: 0.5, sm: 0.5, md: 1 } }} onClick={onForward} disabled={!canGoForward} aria-label="Forward in page history"><RedoIcon /></IconButton></span></Tooltip>
        <Tooltip title="Previous page"><span><IconButton sx={{ p: { xs: 0.5, sm: 0.5, md: 1 } }} onClick={onPrev} disabled={page <= 1} aria-label="Previous"><NavigateBeforeIcon /></IconButton></span></Tooltip>
        <Tooltip title="Next page"><span><IconButton sx={{ p: { xs: 0.5, sm: 0.5, md: 1 } }} onClick={onNext} disabled={numPages !== null && page >= numPages} aria-label="Next"><NavigateNextIcon /></IconButton></span></Tooltip>
        <TextField key={page} inputRef={pageInputRef} size="small" label="Page" defaultValue={page - 1} slotProps={{ htmlInput: { inputMode: 'numeric', 'aria-label': 'Select or type page, starting at zero' }, input: { endAdornment: <InputAdornment position="end"><Tooltip title="Go to page"><IconButton edge="end" size="small" onClick={applyTypedPage} disabled={numPages === null} aria-label="Go to page"><ArrowForwardIcon /></IconButton></Tooltip></InputAdornment> } }} onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            applyTypedPage()
          }
        }} disabled={numPages === null} sx={{ width: { xs: 'clamp(70px, 22vw, 108px)', sm: 70, md: 105 }, flex: '0 0 auto' }} />
        <Typography variant="body2" sx={{ mr: { xs: 0, sm: 1 }, flexShrink: 0, whiteSpace: 'nowrap' }}>of {numPages !== null ? numPages - 1 : '--'}</Typography>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
          <Tooltip title="One page">
            <IconButton color={pagesPerView === 1 ? 'primary' : 'default'} onClick={() => onPagesPerViewChange(1)} aria-label="One page" aria-pressed={pagesPerView === 1}>
              <ArticleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={compact ? 'Two pages unavailable on mobile' : 'Two pages'}>
            <span>
              <IconButton color={pagesPerView === 2 ? 'primary' : 'default'} onClick={() => onPagesPerViewChange(2)} disabled={compact} aria-label="Two pages" aria-pressed={pagesPerView === 2}>
                <MenuBookIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
      {units.length > 0 && <Stack direction="row" sx={{ alignItems: 'center', width: { xs: '100%', md: 'auto' }, minWidth: 0, flexShrink: 0, gridArea: { sm: 'unit' } }}><FormControl size="small" fullWidth sx={{ minWidth: { md: 220 }, flexShrink: 0 }}>
          <Select
            displayEmpty
            value={currentUnit?.page ?? ''}
            onChange={(event) => onSelectUnit(Number(event.target.value))}
            aria-label="Select unit"
            MenuProps={{ disablePortal: true }}
          >
            {units.map((unit) => <MenuItem key={unit.name} value={unit.page}>{unit.name}</MenuItem>)}
          </Select>
        </FormControl></Stack>}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 0.5, width: '100%', display: { xs: 'flex', sm: 'contents' } }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'space-between' }, gap: { xs: 0, sm: 0.5 }, width: { xs: 'auto', md: 'auto' }, flexShrink: 0, gridArea: { sm: 'zoom' } }}>
        <Tooltip title="Zoom out"><IconButton onClick={onZoomOut}><RemoveIcon /></IconButton></Tooltip>
        <Typography variant="body2" sx={{ minWidth: 42, whiteSpace: 'nowrap' }}>{Math.round(scale * 100)}%</Typography>
        <Tooltip title="Zoom in"><IconButton onClick={onZoomIn}><AddIcon /></IconButton></Tooltip>
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: { xs: 'flex-end', sm: 'flex-start' }, gap: { xs: 0, sm: 0.5 }, width: { xs: 'auto', md: 'auto' }, flexShrink: 0, gridArea: { sm: 'actions' } }}>
        <Tooltip title="Audio library"><IconButton color={audioOpen ? 'primary' : 'default'} onClick={onToggleAudio}><AudiotrackIcon /></IconButton></Tooltip>
        <Tooltip title="Video library"><IconButton color={videoOpen ? 'primary' : 'default'} onClick={onToggleVideo}><VideocamIcon /></IconButton></Tooltip>
        <Tooltip title="Notes"><IconButton color={notesOpen ? 'primary' : 'default'} onClick={onToggleNotes} aria-label="Notes"><StickyNote2Icon /></IconButton></Tooltip>
        <Tooltip title="Fullscreen"><IconButton onClick={onToggleFull}><FullscreenIcon /></IconButton></Tooltip>
      </Stack>
      </Stack>
    </Stack>
  )
}
