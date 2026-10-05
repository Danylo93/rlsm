/**
 * Grão de filme sobre a página inteira.
 * Textura SVG (feTurbulence) rasterizada uma vez; o movimento é só transform,
 * então roda na GPU. No celular fica parado para poupar bateria.
 */

const ruido =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1.4 -0.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

export default function Grain() {
    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
            <div
                className="absolute -inset-[20%] opacity-[0.075] md:animate-[grao_0.9s_steps(5)_infinite]"
                style={{ backgroundImage: `url("${ruido}")`, backgroundSize: '220px 220px' }}
            />
        </div>
    )
}
