import React, { useState } from 'react';

interface Event {
  id: string;
  subtitle: string;
  title: string;
  description: string;
  date: string;
  modalContent: {
    event: string;
    dates: string;
    venue: string;
    details: string;
  };
}

const events: Event[] = [
  {
    id: 'event1Modal',
    subtitle: 'AP State Championship',
    title: 'Kyorugi & Poomsae 2025',
    description: 'Junior, Senior, Cadet divisions. Rajiv Gandhi Indoor Stadium, Visakhapatnam',
    date: '29-31 Jan 2025',
    modalContent: {
      event: 'AP State Championship',
      dates: '29-31 Jan 2025',
      venue: 'Rajiv Gandhi Indoor Stadium, Visakhapatnam',
      details: 'Divisions for Junior, Senior, & Cadet. Official registration via the club dashboard. Equipment check and referee seminars included.',
    },
  },
  {
    id: 'event2Modal',
    subtitle: 'National Open',
    title: 'Taekwondo Nationals',
    description: 'Open for top athletes, qualifying rounds for international championship.',
    date: '12-15 Mar 2025',
    modalContent: {
      event: 'National Open',
      dates: '12-15 Mar 2025',
      venue: 'Indira Gandhi Indoor Stadium, New Delhi',
      details: 'Open to athletes holding state championship titles. Registration closes 5 March. Winner represents India internationally.',
    },
  },
  {
    id: 'event3Modal',
    subtitle: 'Coaching Seminar',
    title: 'Coach License Renewal',
    description: 'Mandatory seminar, all active coaches required to register. Hyderabad.',
    date: '28 Feb 2025',
    modalContent: {
      event: 'Coaching Seminar',
      dates: '28 Feb 2025',
      venue: 'Hyderabad Training Center',
      details: 'All active coaches must renew licenses annually. Seminar includes rules updates, medical briefings, and hands-on workshops.',
    },
  },
];

interface EventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center p-4"
      aria-labelledby={`${event.id}Label`}
      aria-hidden="true"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          {/* Fix: Changed event.modalContent.title to event.modalContent.event which exists on the type */}
          <h5 className="font-montserrat font-bold text-xl" id={`${event.id}Label`}>
            {event.modalContent.event}
          </h5>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 text-2xl focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="p-4 text-gray-700">
          <p className="mb-2"><strong>Event:</strong> {event.modalContent.event}</p>
          <p className="mb-2"><strong>Dates:</strong> {event.modalContent.dates}</p>
          <p className="mb-2"><strong>Venue:</strong> {event.modalContent.venue}</p>
          <p className="mb-0"><strong>Details:</strong> {event.modalContent.details}</p>
        </div>
      </div>
    </div>
  );
};

export const EventsUpdates: React.FC = () => {
  const [openModalId, setOpenModalId] = useState<string | null>(null);

  const openModal = (id: string) => setOpenModalId(id);
  const closeModal = () => setOpenModalId(null);

  return (
    <section className="bg-light py-5" id="events">
      <div className="container mx-auto px-4">
        <h2 className="text-center font-montserrat font-bold text-4xl mb-5 text-primary">
          Upcoming Events & Updates
        </h2>
        <div className="flex flex-wrap -mx-4 -my-2">
          {events.map((event) => (
            <div key={event.id} className="w-full md:w-6/12 lg:w-4/12 px-4 py-2">
              <div className="card h-full shadow rounded-lg p-6 bg-white transform hover:scale-105 transition-transform duration-300">
                <div className="card-body">
                  <h6 className="text-gray-500 mb-2">{event.subtitle}</h6>
                  <h5 className="font-montserrat font-bold text-xl mb-2">{event.title}</h5>
                  <p className="text-gray-700 mb-3">{event.description}</p>
                  <p className="text-sm mb-0 text-gray-600">
                    <i className="bi bi-calendar-event mr-1"></i> {event.date}
                  </p>
                  <button
                    className="btn border border-primary text-primary hover:bg-primary hover:text-white rounded-full text-sm py-2 px-4 mt-4 transition-colors duration-200"
                    onClick={() => openModal(event.id)}
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {events.map((event) => (
        <EventModal
          key={event.id}
          event={event}
          isOpen={openModalId === event.id}
          onClose={closeModal}
        />
      ))}
    </section>
  );
};