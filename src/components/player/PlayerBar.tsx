import { useEffect, useRef } from 'react'

interface Props {
  initialSrc: string
}

export default function PlayerBar({ initialSrc }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Src seteado imperativament una sola vez al montar.
  // Sin src en el JSX → React nunca lo rastrea ni lo resetea al reconciliar.
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = initialSrc
    }
  }, [])

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 h-[84px] flex items-center bg-re-player border-t-2 border-re-blue"
    >
      <iframe
        ref={iframeRef}
        id="mc-widget"
        style={{ width: '100%', height: '62px', border: 'none' }}
        allow="autoplay"
      />
    </div>
  )
}
