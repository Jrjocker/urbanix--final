import React from 'react';
import { useParams } from 'react-router-dom';

export default function PublicTicketDetail() {
  const { id } = useParams();
  return <div className="text-center py-10">Detalhes do chamado {id}</div>;
}