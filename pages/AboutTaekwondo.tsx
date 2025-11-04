import React from 'react';

export const AboutTaekwondo: React.FC = () => {
  return (
    <section className="container mx-auto py-8">
      <h1 className="text-center font-montserrat font-bold text-4xl mb-6 text-primary">About Taekwondo</h1>
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="font-montserrat font-bold text-2xl text-secondary mb-3">What is Taekwondo?</h2>
        <p className="text-gray-700 mb-4">
          Taekwondo is a Korean martial art, characterized by its emphasis on head-height kicks, jumping and spinning kicks, and fast kicking techniques.
          It is a combat sport and an Olympic game. Beyond its physical aspects, Taekwondo is also an art of self-defense, a philosophy, and a way of life,
          promoting discipline, respect, and self-control.
        </p>
        <p className="text-gray-700 mb-4">
          The name "Taekwondo" is derived from the Korean words "Tae" (태) meaning "to strike or break with the foot"; "Kwon" (권) meaning "to strike or break with the hand";
          and "Do" (도) meaning "way," "method," or "art." Thus, Taekwondo can be loosely translated as "the way of the foot and the hand."
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="font-montserrat font-bold text-2xl text-secondary mb-3">History and Principles</h2>
        <p className="text-gray-700 mb-4">
          Taekwondo's roots can be traced back to ancient Korean martial arts traditions. It was officially recognized as a unified martial art in South Korea
          on April 11, 1955, by General Choi Hong Hi. Since then, it has grown into a globally practiced sport and martial art.
        </p>
        <p className="text-gray-700 mb-4">
          The principles of Taekwondo are deeply ingrained in its practice:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
          <li><strong>Courtesy (Ye Ui):</strong> Showing respect for others.</li>
          <li><strong>Integrity (Yom Chi):</strong> Being honest and distinguishing right from wrong.</li>
          <li><strong>Perseverance (In Nae):</strong> Achieving goals through determination.</li>
          <li><strong>Self-Control (Guk Gi):</strong> Controlling one's actions and emotions.</li>
          <li><strong>Indomitable Spirit (Baekjul Boolgool):</strong> Facing challenges without fear.</li>
        </ul>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="font-montserrat font-bold text-2xl text-secondary mb-3">Benefits of Practicing Taekwondo</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Improved physical fitness, including strength, flexibility, and cardiovascular health.</li>
          <li>Enhanced mental discipline, focus, and concentration.</li>
          <li>Development of self-defense skills and increased confidence.</li>
          <li>Stress reduction and improved emotional regulation.</li>
          <li>Fostering of respect, humility, and a strong moral compass.</li>
        </ul>
      </div>
    </section>
  );
};