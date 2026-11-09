import { buildMetadata, RootDocument } from '../shell'

export const metadata = buildMetadata('pt')

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootDocument locale="pt">{children}</RootDocument>
}
