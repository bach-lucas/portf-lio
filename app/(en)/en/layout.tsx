import { buildMetadata, RootDocument } from '../../shell'

export const metadata = buildMetadata('en')

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootDocument locale="en">{children}</RootDocument>
}
