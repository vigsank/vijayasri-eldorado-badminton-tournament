import React, { useEffect, useState } from 'react';
import { Box, SimpleGrid, Input, Select, Heading, VStack, Text } from '@chakra-ui/react';
import { useSocket } from '../context/SocketContext';
import MatchCard from '../components/MatchCard';

const Schedule = () => {
    const [matches, setMatches] = useState([]);
    const [players, setPlayers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filterCategory, setFilterCategory] = useState('');
    const [searchPlayer, setSearchPlayer] = useState('');
    const [loading, setLoading] = useState(true);

    const socket = useSocket();

    useEffect(() => {
        fetch('/api/data')
            .then(res => res.json())
            .then(data => {
                setMatches(data.matches);
                setPlayers(data.players || []);
                setCategories(data.categories);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('MATCH_UPDATE', (updatedMatch) => {
            setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
        });
        socket.on('DATA_REFRESH', (data) => {
            setMatches(data.matches);
            setCategories(data.categories);
            setPlayers(data.players || []);
        });
        return () => {
            socket.off('MATCH_UPDATE');
            socket.off('DATA_REFRESH');
        };
    }, [socket]);

    const filteredMatches = matches.filter(match => {
        const matchCategory = filterCategory ? match.category === filterCategory : true;
        const matchPlayer = searchPlayer ? (
            match.player1.toLowerCase().includes(searchPlayer.toLowerCase()) ||
            match.player2.toLowerCase().includes(searchPlayer.toLowerCase())
        ) : true;
        return matchCategory && matchPlayer;
    });

    return (
        <Box w="full" maxW={{ base: '100%', xl: '1400px' }} mx="auto" py={{ base: 4, md: 6 }} px={{ base: 2, md: 4 }}>
            <Heading mb={4} size={{ base: 'lg', md: 'xl' }} color="jazzy.neon">Tournament Schedule</Heading>

            <VStack spacing={3} align="stretch" mb={6} bg="whiteAlpha.100" p={{ base: 3, md: 4 }} borderRadius="lg">
                <Select placeholder="All Categories" onChange={(e) => setFilterCategory(e.target.value)} color="white" size={{ base: 'md', md: 'lg' }}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Select>
                <Input
                    placeholder="Search Player..."
                    onChange={(e) => setSearchPlayer(e.target.value)}
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                    size={{ base: 'md', md: 'lg' }}
                />
            </VStack>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 3, md: 4 }}>
                {filteredMatches.map(match => (
                    <MatchCard key={match.id} match={match} allPlayers={players} />
                ))}
            </SimpleGrid>

            {!loading && filteredMatches.length === 0 && (
                <Text color="gray.400" textAlign="center">No matches found.</Text>
            )}
        </Box>
    );
};

export default Schedule;
