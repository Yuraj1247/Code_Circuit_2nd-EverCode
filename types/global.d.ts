// Add proper type definitions for the Web Speech API
declare var SpeechRecognition: any
interface Window {
  SpeechRecognition: typeof SpeechRecognition
  webkitSpeechRecognition: typeof SpeechRecognition
  speechSynthesis: SpeechSynthesis
  SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance
}
