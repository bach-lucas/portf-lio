import type { Metadata } from 'next'
import { Cosmos } from '../../components/cosmos/Cosmos'
import '../../components/cosmos/cosmos.css'

// Prévia da versão cósmica do portfólio: fora do índice até virar a página principal.
export const metadata: Metadata = {
  title: 'Prévia cosmos',
  robots: { index: false, follow: false },
}

export default function CosmosPreview() {
  return <Cosmos />
}
