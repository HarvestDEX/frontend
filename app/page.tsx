import Hero from './components/landing/Hero'
import Features from './components/landing/Features'
import HowItWorks from './components/landing/HowItWorks'
import Commodities from './components/landing/Commodities'
import Footer from './components/landing/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <Commodities />
      <Footer />
    </main>
  )
}
