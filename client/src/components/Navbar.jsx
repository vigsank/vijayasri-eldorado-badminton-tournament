import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Button, Spacer, IconButton,
    useColorModeValue, useDisclosure, Modal, ModalOverlay,
    ModalContent, ModalHeader, ModalBody, ModalFooter,
    ModalCloseButton, VStack, Text, Input, Divider,
    useToast, AlertDialog, AlertDialogBody, AlertDialogFooter,
    AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
    UnorderedList, ListItem, Drawer, DrawerBody, DrawerHeader,
    DrawerOverlay, DrawerContent, DrawerCloseButton, Show, Hide
} from '@chakra-ui/react';
import { NavLink as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSettings, FiTrash2, FiUserPlus, FiMenu } from 'react-icons/fi';

const NavButton = ({ to, children, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Button
            as={RouterLink}
            to={to}
            variant="ghost"
            color={isActive ? 'jazzy.neon' : 'white'}
            _hover={{ color: 'jazzy.neon' }}
            onClick={onClick}
            w={{ base: 'full', md: 'auto' }}
            justifyContent={{ base: 'flex-start', md: 'center' }}
        >
            {children}
        </Button>
    );
};

const Navbar = () => {
    const { isAdmin, isSuperAdmin, logout, userPhone } = useAuth();
    const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
    const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

    return (
        <>
            <Box
                bg="rgba(255, 255, 255, 0.05)"
                backdropFilter="blur(10px)"
                px={4}
                py={3}
                position="sticky"
                top={0}
                zIndex={100}
                borderBottom="1px solid"
                borderColor="whiteAlpha.200"
            >
                <Flex alignItems="center" maxW="1200px" mx="auto">
                    <Heading
                        size={{ base: 'sm', md: 'md' }}
                        color="jazzy.neon"
                        letterSpacing="wider"
                        noOfLines={1}
                    >
                        VIJAYASRI ELDORADO Badminton Tournament - 2026
                    </Heading>
                    <Spacer />

                    {/* Desktop Navigation */}
                    <Hide below="md">
                        <Flex gap={2} alignItems="center">
                            <NavButton to="/">Live</NavButton>
                            <NavButton to="/schedule">Schedule</NavButton>
                            <NavButton to="/rules">Rules</NavButton>
                            <NavButton to="/admin">
                                {isAdmin ? 'Committee' : 'Admin'}
                            </NavButton>
                            {isSuperAdmin && (
                                <IconButton
                                    icon={<FiSettings />}
                                    variant="ghost"
                                    color="jazzy.neon"
                                    onClick={onSettingsOpen}
                                    aria-label="Settings"
                                />
                            )}
                            {isAdmin && (
                                <Button onClick={logout} variant="outline" size="sm" colorScheme="red">
                                    Logout
                                </Button>
                            )}
                        </Flex>
                    </Hide>

                    {/* Mobile Menu Button */}
                    <Show below="md">
                        <Flex gap={2} alignItems="center">
                            {isSuperAdmin && (
                                <IconButton
                                    icon={<FiSettings />}
                                    variant="ghost"
                                    color="jazzy.neon"
                                    onClick={onSettingsOpen}
                                    aria-label="Settings"
                                    size="sm"
                                />
                            )}
                            <IconButton
                                icon={<FiMenu />}
                                variant="ghost"
                                color="white"
                                onClick={onDrawerOpen}
                                aria-label="Menu"
                                size="md"
                            />
                        </Flex>
                    </Show>
                </Flex>
            </Box>

            {/* Mobile Navigation Drawer */}
            <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose}>
                <DrawerOverlay backdropFilter="blur(5px)" />
                <DrawerContent bg="gray.900" color="white">
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px" borderColor="whiteAlpha.200">
                        <Text color="jazzy.neon">Menu</Text>
                    </DrawerHeader>
                    <DrawerBody pt={4}>
                        <VStack spacing={2} align="stretch">
                            <NavButton to="/" onClick={onDrawerClose}>🏠 Live Matches</NavButton>
                            <NavButton to="/schedule" onClick={onDrawerClose}>📅 Schedule</NavButton>
                            <NavButton to="/rules" onClick={onDrawerClose}>📖 Rules</NavButton>
                            <NavButton to="/admin" onClick={onDrawerClose}>
                                🔐 {isAdmin ? 'Committee Panel' : 'Admin Login'}
                            </NavButton>

                            {isAdmin && (
                                <>
                                    <Divider my={4} borderColor="whiteAlpha.300" />
                                    <Button
                                        onClick={() => { logout(); onDrawerClose(); }}
                                        variant="outline"
                                        colorScheme="red"
                                        w="full"
                                    >
                                        Logout
                                    </Button>
                                </>
                            )}
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            {isSuperAdmin && <SettingsModal isOpen={isSettingsOpen} onClose={onSettingsClose} userPhone={userPhone} />}
        </>
    );
};

const SettingsModal = ({ isOpen, onClose, userPhone }) => {
    const [admins, setAdmins] = useState([]);
    const [superAdmins, setSuperAdmins] = useState([]);
    const [newAdmin, setNewAdmin] = useState('');
    const [activeSection, setActiveSection] = useState('main'); // 'main', 'reset-1', 'reset-2'
    const toast = useToast();
    const cancelRef = React.useRef();

    const fetchAdmins = async () => {
        try {
            const adminsRes = await fetch(`/api/admin/list?phone=${userPhone}`);
            if (adminsRes.ok) {
                const adminsData = await adminsRes.json();
                if (adminsData.admins) setAdmins(adminsData.admins);
            } else {
                console.error("Failed to fetch admins list:", adminsRes.status);
                toast({ title: "Could not load admins", status: "error" });
            }

            const superAdminsRes = await fetch('/api/admin/super-admins');
            if (superAdminsRes.ok) {
                const superAdminsData = await superAdminsRes.json();
                if (superAdminsData.superAdmins) setSuperAdmins(superAdminsData.superAdmins);
            } else {
                console.error("Failed to fetch super admins list:", superAdminsRes.status);
            }
        } catch (err) {
            console.error("Error fetching admin lists", err);
            toast({ title: "Error loading lists", status: "error" });
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAdmins();
            setActiveSection('main');
        }
    }, [isOpen]);

    const handleAddAdmin = async () => {
        if (!newAdmin) return;
        try {
            const res = await fetch('/api/admin/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ superPhone: userPhone, newAdminPhone: newAdmin })
            });
            const data = await res.json();
            if (data.success) {
                await fetchAdmins(); // Re-fetch both lists to ensure consistency
                setNewAdmin('');
                toast({ title: "Admin Added", status: "success" });
            } else {
                toast({ title: "Failed to add admin", description: data.error, status: "error" });
            }
        } catch (err) {
            toast({ title: "Error", status: "error" });
        }
    };

    const handleMasterReset = async () => {
        try {
            const res = await fetch('/api/admin/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: userPhone })
            });
            const data = await res.json();
            if (data.success) {
                toast({
                    title: "System Reset Successful",
                    description: "All tournament data has been cleared.",
                    status: "success",
                    duration: 5000
                });
                onClose();
            }
        } catch (err) {
            toast({ title: "Reset Failed", status: "error" });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'lg' }}>
            <ModalOverlay backdropFilter="blur(5px)" />
            <ModalContent bg="gray.900" border="1px solid" borderColor="whiteAlpha.200" m={{ base: 0, md: 4 }}>
                <ModalHeader color="jazzy.neon">System Settings</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <VStack spacing={6} align="stretch">
                        <Box>
                            <Heading size="sm" mb={3} display="flex" alignItems="center" gap={2}>
                                <FiUserPlus /> Manage Committee
                            </Heading>
                            <Flex gap={2} mb={4} direction={{ base: 'column', sm: 'row' }}>
                                <Input
                                    placeholder="Add Admin Phone Number"
                                    value={newAdmin}
                                    onChange={(e) => setNewAdmin(e.target.value)}
                                    bg="whiteAlpha.50"
                                    borderColor="whiteAlpha.300"
                                    flex={1}
                                />
                                <Button colorScheme="green" px={8} onClick={handleAddAdmin} w={{ base: 'full', sm: 'auto' }}>Add</Button>
                            </Flex>
                            <Text fontSize="xs" color="gray.500" mb={1}>Current Admins:</Text>
                            <Box bg="whiteAlpha.50" p={3} borderRadius="md" maxH="150px" overflowY="auto">
                                <UnorderedList spacing={1}>
                                    {admins.map(a => (
                                        <ListItem key={a} fontSize="sm">
                                            {a} {superAdmins.includes(a) && <Text as="span" color="jazzy.neon" fontSize="xs" ml={2}>(Super-Admin)</Text>}
                                        </ListItem>
                                    ))}
                                </UnorderedList>
                            </Box>
                        </Box>

                        <Divider borderColor="whiteAlpha.300" />

                        <Box>
                            <Heading size="sm" mb={3} color="red.400" display="flex" alignItems="center" gap={2}>
                                <FiTrash2 /> Danger Zone
                            </Heading>
                            <Button
                                colorScheme="red"
                                variant="outline"
                                w="full"
                                onClick={() => setActiveSection('reset-1')}
                            >
                                Master Reset System
                            </Button>
                            <Text fontSize="xs" color="gray.500" mt={2}>
                                This will reset all match scores and statuses back to the original scheduled state. Players and groupings will not be affected.
                            </Text>
                        </Box>
                    </VStack>
                </ModalBody>
            </ModalContent>

            {/* Step 1: First Confirmation */}
            <AlertDialog
                isOpen={activeSection === 'reset-1'}
                leastDestructiveRef={cancelRef}
                onClose={() => setActiveSection('main')}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent bg="gray.800" color="white" border="2px solid" borderColor="orange.400" mx={4}>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            ⚠️ Warning: Initial Confirmation
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            You are about to initiate a **Scores Reset**. This action will revert all matches to their original, unscored state.
                            <Text mt={4} fontWeight="bold" color="orange.300">
                                Players and groups will remain unchanged. Are you sure you want to proceed?
                            </Text>
                        </AlertDialogBody>

                        <AlertDialogFooter flexWrap="wrap" gap={2}>
                            <Button ref={cancelRef} onClick={() => setActiveSection('main')} flex={{ base: 1, sm: 'none' }}>
                                Cancel
                            </Button>
                            <Button colorScheme="orange" onClick={() => setActiveSection('reset-2')} flex={{ base: 1, sm: 'none' }}>
                                Yes, Proceed
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Step 2: Final Confirmation */}
            <AlertDialog
                isOpen={activeSection === 'reset-2'}
                leastDestructiveRef={cancelRef}
                onClose={() => setActiveSection('main')}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent bg="gray.900" color="white" border="4px solid" borderColor="red.600" mx={4}>
                        <AlertDialogHeader fontSize="xl" fontWeight="black" color="red.500">
                            🛑 FINAL WARNING: RESET SCORES
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <VStack align="stretch" spacing={4}>
                                <Text>
                                    This is your **LAST CHANCE** to turn back. Clicking "RESET SCORES" will revert all matches to their scheduled state.
                                </Text>
                                <Box bg="blackAlpha.500" p={4} borderRadius="md" borderLeft="4px solid" borderColor="red.600">
                                    <Text color="red.200" fontSize="sm">
                                        • All <strong>Match Scores</strong> will be set to 0-0.<br />
                                        • All <strong>Match Statuses</strong> will be changed to 'SCHEDULED'.<br />
                                        • All <strong>Standings</strong> will be recalculated based on the reset scores.
                                    </Text>
                                </Box>
                                <Text fontWeight="bold" textAlign="center" py={2} bg="red.900" borderRadius="md">
                                    THIS ACTION CANNOT BE UNDONE.
                                </Text>
                            </VStack>
                        </AlertDialogBody>

                        <AlertDialogFooter flexDir="column" gap={3}>
                            <Button colorScheme="red" size="lg" w="full" onClick={handleMasterReset}>
                                YES, RESET ALL SCORES
                            </Button>
                            <Button ref={cancelRef} variant="ghost" onClick={() => setActiveSection('main')} w="full">
                                I changed my mind, Keep Data
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Modal>
    );
};

export default Navbar;