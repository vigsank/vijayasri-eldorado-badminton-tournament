import React, { useState, useEffect } from 'react';
import { Box, Button, Input, VStack, Heading, Text, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Admin = () => {
    const { isAdmin, login } = useAuth();
    const [phone, setPhone] = useState('');
    const toast = useToast();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            if (data.isCommittee) {
                login('ADMIN', data.phone, data.isSuperAdmin);
                toast({ title: "Welcome Committee Member", status: "success" });
            } else {
                toast({ title: "Access Denied", description: "Not a committee number", status: "error" });
            }
        } catch (err) {
            toast({ title: "Error", status: "error" });
        }
    };

    if (!isAdmin) {
        return (
            <Box maxW="sm" mx={{ base: 4, sm: 'auto' }} mt={{ base: 10, md: 20 }} p={{ base: 6, md: 8 }} bg="whiteAlpha.100" borderRadius="xl">
                <Heading size={{ base: 'md', md: 'lg' }} mb={6} textAlign="center" color="jazzy.neon">Committee Login</Heading>
                <VStack spacing={4}>
                    <Input
                        placeholder="Enter Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        color="white"
                        size={{ base: 'lg', md: 'md' }}
                    />
                    <Button w="full" variant="solid" bg="jazzy.neon" color="black" onClick={handleLogin} size={{ base: 'lg', md: 'md' }}>
                        Login
                    </Button>
                    <Button w="full" variant="ghost" onClick={() => { login('GUEST'); navigate('/'); }} size={{ base: 'lg', md: 'md' }}>
                        Continue as Guest (Read-only)
                    </Button>
                </VStack>
            </Box>
        );
    }

    return <AdminDashboard />;
};

const AdminDashboard = () => {
    const [matches, setMatches] = useState([]);
    const [editingMatch, setEditingMatch] = useState(null);
    const socket = useSocket();

    // Fetch logic similar to others (should refactor)
    useEffect(() => {
        fetch('/api/data')
            .then(res => res.json())
            .then(data => setMatches(data.matches));

        if (!socket) return;
        socket.on('MATCH_UPDATE', (updatedMatch) => {
            setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
        });
        return () => socket.off('MATCH_UPDATE');
    }, [socket]);

    const updateMatch = async (id, updates) => {
        await fetch('/api/matches/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matchId: id, ...updates })
        });
        setEditingMatch(null); // Close modal
    };

    return (
        <Box w="full" maxW="100%" px={{ base: 2, md: 4 }} py={{ base: 4, md: 6 }}>
            <Heading mb={4} size={{ base: 'lg', md: 'xl' }} color="jazzy.neon">Match Management</Heading>
            <VStack spacing={{ base: 2, md: 3 }} align="stretch">
                {matches.map(match => (
                    <Box
                        key={match.id}
                        p={{ base: 3, md: 4 }}
                        bg="whiteAlpha.100"
                        borderRadius="md"
                        display="flex"
                        flexDirection={{ base: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ base: 'stretch', sm: 'center' }}
                        gap={{ base: 3, sm: 4 }}
                    >
                        <Box flex={1}>
                            <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }}>{match.player1} vs {match.player2}</Text>
                            <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.400">{match.category} - {match.status}</Text>
                            {match.score && <Text color="jazzy.300" fontSize={{ base: 'sm', md: 'md' }}>Score: {match.score.p1} - {match.score.p2}</Text>}
                        </Box>
                        <Button
                            size={{ base: 'md', md: 'sm' }}
                            onClick={() => setEditingMatch(match)}
                            colorScheme="teal"
                            w={{ base: 'full', sm: 'auto' }}
                        >
                            Update
                        </Button>
                    </Box>
                ))}
            </VStack>

            {editingMatch && (
                <EditMatchModal
                    match={editingMatch}
                    isOpen={true}
                    onClose={() => setEditingMatch(null)}
                    onUpdate={updateMatch}
                />
            )}
        </Box>
    );
};

const EditMatchModal = ({ match, isOpen, onClose, onUpdate }) => {
    const [status, setStatus] = useState(match.status);
    const [score, setScore] = useState(match.score || { p1: 0, p2: 0 }); // Simple score object or string
    // Let's use simple text for now to be flexible or JSON object
    // "Option to enter score at end of each match"
    // Let's treat score as an object { p1: "21", p2: "19" } or something.
    // I'll implement simple input for now.

    const [p1Score, setP1Score] = useState(match.score?.p1 || 0);
    const [p2Score, setP2Score] = useState(match.score?.p2 || 0);
    const [winner, setWinner] = useState(match.winner || '');

    const handleSave = () => {
        onUpdate(match.id, {
            status,
            score: { p1: p1Score, p2: p2Score },
            winner: status === 'COMPLETED' ? winner : null
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'md' }}>
            <ModalOverlay backdropFilter="blur(5px)" />
            <ModalContent bg="gray.800" color="white" m={{ base: 0, md: 4 }}>
                <ModalHeader fontSize={{ base: 'md', md: 'lg' }}>Update Match: {match.player1} vs {match.player2}</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6} px={{ base: 4, md: 6 }}>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel>Status</FormLabel>
                            <Select value={status} onChange={(e) => setStatus(e.target.value)} size={{ base: 'lg', md: 'md' }}>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="PLAYING">Playing (Live)</option>
                                <option value="COMPLETED">Completed</option>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Score (Current / Final)</FormLabel>
                            <Box display="flex" gap={{ base: 3, md: 2 }} alignItems="center" justifyContent="center">
                                <VStack flex={1}>
                                    <Text fontSize={{ base: 'xs', md: 'sm' }} noOfLines={1} textAlign="center">{match.player1}</Text>
                                    <Input type="number" value={p1Score} onChange={(e) => setP1Score(e.target.value)} size={{ base: 'lg', md: 'md' }} textAlign="center" />
                                </VStack>
                                <Text fontSize={{ base: 'xl', md: 'lg' }}>-</Text>
                                <VStack flex={1}>
                                    <Text fontSize={{ base: 'xs', md: 'sm' }} noOfLines={1} textAlign="center">{match.player2}</Text>
                                    <Input type="number" value={p2Score} onChange={(e) => setP2Score(e.target.value)} size={{ base: 'lg', md: 'md' }} textAlign="center" />
                                </VStack>
                            </Box>
                        </FormControl>

                        {status === 'COMPLETED' && (
                            <FormControl>
                                <FormLabel>Winner</FormLabel>
                                <Select placeholder="Select Winner" value={winner} onChange={(e) => setWinner(e.target.value)} size={{ base: 'lg', md: 'md' }}>
                                    <option value={match.player1}>{match.player1}</option>
                                    <option value={match.player2}>{match.player2}</option>
                                </Select>
                            </FormControl>
                        )}
                    </VStack>
                    <Button mt={6} colorScheme="green" w="full" onClick={handleSave} size={{ base: 'lg', md: 'md' }}>
                        Save Changes
                    </Button>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default Admin;
