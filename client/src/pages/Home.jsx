import React, { useEffect, useState } from 'react';
import { Box, SimpleGrid, Text, Heading, Spinner, Center } from '@chakra-ui/react';
import { useSocket } from '../context/SocketContext';
import MatchCard from '../components/MatchCard';

const Home = () => {
    const [matches, setMatches] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const socket = useSocket();

    const fetchData = async () => {
        try {
            const res = await fetch('/api/data');
            const data = await res.json();
            setMatches(data.matches);
            setPlayers(data.players || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('MATCH_UPDATE', (updatedMatch) => {
            setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
        });
        socket.on('DATA_REFRESH', (data) => {
            setMatches(data.matches);
            setPlayers(data.players || []);
        });
        return () => {
            socket.off('MATCH_UPDATE');
            socket.off('DATA_REFRESH');
        };
    }, [socket]);

    const liveMatches = matches.filter(m => m.status === 'PLAYING');
    const upcomingMatches = matches.filter(m => m.status === 'SCHEDULED' || m.status === 'COMPLETED').slice(0, 12); // Show broader list

    if (loading) return <Center h="50vh"><Spinner size="xl" color="jazzy.neon" /></Center>;

    return (
        <Box w="full" maxW={{ base: '100%', xl: '1400px' }} mx="auto" py={{ base: 4, md: 6 }} px={{ base: 2, md: 4 }}>
            <Heading mb={4} size={{ base: 'lg', md: 'xl' }} color="jazzy.neon">Live On Court</Heading>

            {liveMatches.length === 0 ? (
                <Text color="gray.400" fontSize="lg" mb={8}>No matches currently in progress.</Text>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={10}>
                    {liveMatches.map(match => (
                        <MatchCard key={match.id} match={match} isLive={true} allPlayers={players} />
                    ))}
                </SimpleGrid>
            )}

            <Heading mb={4} size={{ base: 'md', md: 'lg' }} color="whiteAlpha.800">All Matches</Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 3, md: 4 }}>
                {matches.filter(m => m.status !== 'PLAYING').slice(0, 12).map(match => (
                    <MatchCard key={match.id} match={match} allPlayers={players} />
                ))}
            </SimpleGrid>
        </Box>
    );
};

export default Home;
