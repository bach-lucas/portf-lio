import { Cosmos } from '../components/cosmos/Cosmos'
import { introGate } from '../components/cosmos/opening'
import '../components/cosmos/cosmos.css'

export default function Home() {
  return <>
    <script dangerouslySetInnerHTML={{ __html: introGate }} />
    <Cosmos />
  </>
}
