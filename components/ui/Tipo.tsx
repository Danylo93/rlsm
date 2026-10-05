import type { ReactNode } from 'react'

/** rótulo pequeno de capítulo: fio ácido + texto mono */
export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <p className={`ui-escala mono flex items-center gap-3 text-[10px] text-osso/75 sm:text-[11px] ${className}`}>
            <span aria-hidden className="h-px w-8 bg-acido" />
            {children}
        </p>
    )
}
