import { permanentRedirect } from 'next/navigation'

// A prévia virou a home; o endereço antigo continua valendo para links já compartilhados.
export default function CosmosPreview() {
  permanentRedirect('/')
}
