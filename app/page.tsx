"use client";

import { Amplify } from 'aws-amplify'
import outputs from '@/amplify_outputs.json'
import IzakayaChat from '@/app/components/IzakayaChat'
import '@aws-amplify/ui-react/styles.css'

Amplify.configure(outputs)

export default function App() {
  return (
    <main className="h-screen bg-gray-50">
      <IzakayaChat />
    </main>
  );
}
