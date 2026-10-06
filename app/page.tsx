import { About } from '../components/About'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { IntroSequence } from '../components/IntroSequence'
import { Projects } from '../components/Projects'
import { Proof } from '../components/Proof'
import { SilkBackground } from '../components/SilkBackground'
import { Story } from '../components/Story'
import { UniverseLayer } from '../components/UniverseLayer'
import { sections } from '../data/site'

export default function Home() {
  return <>
    <IntroSequence /><UniverseLayer /><SilkBackground /><div className="noise" aria-hidden="true" />
    <Header />
    <main id={sections.home.id}>
      <Hero />
      <Proof />
      <Projects />
      <Story />
      <About />
    </main>
    <Footer />
  </>
}
