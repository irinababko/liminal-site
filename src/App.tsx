import { Hero } from './sections/Hero/Hero';
import { Breath } from './sections/Breath/Breath';
import { Current } from './sections/Current/Current';
import { Resonance } from './sections/Resonance/Resonance';
import { Threshold } from './sections/Threshold/Threshold';
import { Verse } from './sections/Verse/Verse';
import { Origin } from './sections/Origin/Origin';
import { Footer } from './components/Footer/Footer';

function App() {
  return (
    <>
      <main>
        <Hero />
        <Breath />
        <Current />
        <Resonance />
        <Threshold />
        <Verse />
        <Origin />
      </main>
      <Footer />
    </>
  );
}

export default App;
