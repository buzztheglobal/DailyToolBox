// frontend/src/components/Content/CardsSection.js
import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid } from '@mui/material';

function CardsSection({ selectedCategory }) {
  // Mock data for demonstration. In a real app, this would be fetched from a backend API
  // based on the selectedCategory.
  const allCards = {
    home: [
      { id: 1, title: 'Featured Tool 1', description: 'A brief description of a popular tool.', icon: '🛠️' },
      { id: 2, title: 'Featured Converter 1', description: 'Convert units with ease.', icon: '🔄' },
      { id: 3, title: 'Daily Tip', description: 'Learn something new every day.', icon: '💡' },
      { id: 4, title: 'Quick Calculator', description: 'Perform quick calculations.', icon: '🧮' },
    ],
    tools: [
      { id: 101, title: 'Online Calculator', description: 'A robust calculator for all your needs.', icon: '➕' },
      { id: 102, title: 'Unit Converter', description: 'Convert between various units (length, weight, etc.).', icon: '📏' },
      { id: 103, title: 'Random Password Generator', description: 'Generate strong, secure passwords.', icon: '🔑' },
      { id: 104, title: 'QR Code Generator', description: 'Create QR codes from text or URLs.', icon: '📷' },
    ],
    convertors: [
      { id: 201, title: 'Currency Converter', description: 'Real-time currency exchange rates.', icon: '💲' },
      { id: 202, title: 'Temperature Converter', description: 'Convert between Celsius, Fahrenheit, and Kelvin.', icon: '🌡️' },
      { id: 203, title: 'Area Converter', description: 'Convert different units of area.', icon: '🏞️' },
      { id: 204, title: 'Volume Converter', description: 'Convert different units of volume.', icon: '💧' },
    ],
    // Add more categories as needed
  };

  const cardsToDisplay = allCards[selectedCategory] || allCards.home;

  return (
    <Container component="section" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ textTransform: 'capitalize', mb: 4 }}>
        {selectedCategory === 'home' ? 'Popular Tools & Converters' : `${selectedCategory} Spotlight`}
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {cardsToDisplay.map((card) => (
          <Grid item key={card.id} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                  {card.icon}
                </Typography>
                <Typography gutterBottom variant="h5" component="h2">
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default CardsSection;
