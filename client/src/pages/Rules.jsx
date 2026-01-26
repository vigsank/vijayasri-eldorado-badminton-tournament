import React from 'react';
import {
    Box, Heading, Text, VStack, Table, Thead, Tbody, Tr, Th, Td,
    Divider, UnorderedList, ListItem, OrderedList, Badge, Flex, Icon
} from '@chakra-ui/react';

const SectionHeading = ({ children, color = "jazzy.pink" }) => (
    <Heading
        as="h3"
        size="lg"
        mt={8}
        mb={4}
        color={color}
        borderBottom="2px solid"
        borderColor={color}
        pb={2}
    >
        {children}
    </Heading>
);

const InfoBox = ({ children, borderColor = "jazzy.neon" }) => (
    <Box
        borderLeft="4px solid"
        borderColor={borderColor}
        pl={4}
        py={3}
        my={4}
        bg="whiteAlpha.100"
        borderRadius="md"
    >
        {children}
    </Box>
);

const Rules = () => {
    return (
        <Box w="full" maxW={{ base: '100%', lg: '900px' }} mx="auto" px={{ base: 3, md: 6, lg: 8 }} py={{ base: 4, md: 8 }} color="white">
            {/* Header */}
            <VStack spacing={2} mb={8} textAlign="center">
                <Text fontSize="4xl">🏆</Text>
                <Heading as="h1" size="2xl" color="jazzy.neon">
                    Official Tournament Rule Book
                </Heading>
                <Heading as="h2" size="lg" color="jazzy.300" fontWeight="normal">
                    Vijayasri Eldorado Badminton Tournament 2026
                </Heading>
            </VStack>

            <Text mb={6} fontSize="md" color="gray.300" textAlign="center">
                This official rule book governs all matches and scheduling for the Vijayasri Eldorado tournament.
                These rules have been specifically designed to ensure player safety, fair progression, and strict adherence to court timings.
            </Text>

            <Divider my={8} borderColor="whiteAlpha.400" />

            {/* Section I */}
            <SectionHeading>I. Core Scheduling Constraints</SectionHeading>

            <InfoBox>
                <Text fontWeight="bold" color="jazzy.neon" mb={2}>🚩 Kids' Category Priority</Text>
                <Text>
                    All Kids' matches (Boys & Girls), including League stages, Semi-Finals, and Finals,{' '}
                    <Text as="span" fontWeight="bold" color="jazzy.neon">must be completed by 8:00 PM on Saturday</Text>.
                    Adult matches are interspersed only to provide necessary rest for the kids.
                </Text>
            </InfoBox>

            <InfoBox>
                <Text fontWeight="bold" color="jazzy.neon" mb={2}>⚖️ Player Welfare (Rest Rule)</Text>
                <Text>
                    To prevent fatigue and injury, utmost care was taken to ensure{' '}
                    <Text as="span" fontWeight="bold" color="jazzy.neon">no player shall play two matches in successive time slots</Text>.
                    A minimum <Text as="span" fontWeight="bold" color="jazzy.neon">15-minute rest period</Text> is mandatory between matches for any individual player.
                </Text>
            </InfoBox>

            <Text fontSize="sm" color="gray.400" mt={4}>
                <Text as="span" fontWeight="bold">Note:</Text> There may be exceptions only in the case of unavoidable scheduling conflicts,
                but the committee will see if any modifications can be made on the Game days (as the games are in progress).
                At this moment, the schedule designed will prevail as is.
            </Text>

            <Divider my={8} borderColor="whiteAlpha.400" />

            {/* Section II */}
            <SectionHeading>II. Scoring System & Match Formats</SectionHeading>

            <Box overflowX="auto" my={6}>
                <Table variant="simple" size="sm">
                    <Thead bg="jazzy.neon">
                        <Tr>
                            <Th color="black" fontWeight="bold">Category</Th>
                            <Th color="black" fontWeight="bold">League Stage</Th>
                            <Th color="black" fontWeight="bold">Semi-Finals</Th>
                            <Th color="black" fontWeight="bold">Finals</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td fontWeight="bold">Kids (Boys/Girls)</Td>
                            <Td>11 Points</Td>
                            <Td>15 Points</Td>
                            <Td>Best of 3 Sets (13 Pts)</Td>
                        </Tr>
                        <Tr>
                            <Td fontWeight="bold">Adults (Men/Women)</Td>
                            <Td>15 Points</Td>
                            <Td>15 Points</Td>
                            <Td>Best of 3 Sets (15 Pts)</Td>
                        </Tr>
                        <Tr>
                            <Td fontWeight="bold">Mens Doubles</Td>
                            <Td>21 Points</Td>
                            <Td>21 Points</Td>
                            <Td>Best of 3 Sets (21 Pts)</Td>
                        </Tr>
                    </Tbody>
                </Table>
            </Box>

            <Divider my={8} borderColor="whiteAlpha.400" />

            {/* Section III */}
            <SectionHeading>III. ⚡ The "Intact Duration" Deuce Rule</SectionHeading>

            <Text mb={4}>
                To ensure the tournament stays on schedule and not one match drags on indefinitely, the following Deuce rule is implemented:
            </Text>

            <InfoBox>
                <Text fontWeight="bold" mb={3}>If a game reaches a deuce (e.g., 10-10 or 14-14):</Text>
                <OrderedList spacing={2} pl={4}>
                    <ListItem>Only <Text as="span" fontWeight="bold" color="jazzy.neon">one</Text> Deuce + Advantage cycle is allowed.</ListItem>
                    <ListItem>If the score becomes tied again (entering a <Text as="span" fontWeight="bold" color="jazzy.neon">Second Deuce</Text>), the match moves to a <Text as="span" fontWeight="bold" color="jazzy.neon">Golden Point</Text>.</ListItem>
                    <ListItem>Whoever wins the immediate next point (the <Text as="span" fontWeight="bold" color="jazzy.neon">Golden Point</Text>) wins the game, irrespective of who won the first advantage round.</ListItem>
                </OrderedList>
            </InfoBox>

            <Divider my={8} borderColor="whiteAlpha.400" />

            {/* Section IV */}
            <SectionHeading>IV. The 3-Level Tie-Breaker Rule</SectionHeading>

            <Text mb={4}>
                If two or more players/teams are tied on "Match Wins" at the end of the League Stage, the following granular rules apply in order:
            </Text>

            <VStack spacing={3} align="stretch">
                <Box p={4} bg="whiteAlpha.100" borderRadius="md" borderLeft="4px solid" borderColor="blue.400">
                    <Text fontWeight="bold" color="blue.400">Level 1 (Head-to-Head):</Text>
                    <Text>The winner of the match between the two tied players/teams ranks higher.</Text>
                </Box>
                <Box p={4} bg="whiteAlpha.100" borderRadius="md" borderLeft="4px solid" borderColor="purple.400">
                    <Text fontWeight="bold" color="purple.400">Level 2 (Net Point Difference):</Text>
                    <Text>If 3 players are tied, we calculate: <Text as="span" fontWeight="bold">(Total Points Won in all group matches) minus (Total Points Lost in all group matches)</Text>. The highest positive number wins.</Text>
                </Box>
                <Box p={4} bg="whiteAlpha.100" borderRadius="md" borderLeft="4px solid" borderColor="orange.400">
                    <Text fontWeight="bold" color="orange.400">Level 3 (Total Points Scored):</Text>
                    <Text>If still tied, the player who scored the highest total number of points throughout the league stage ranks higher.</Text>
                </Box>
            </VStack>

            <Divider my={8} borderColor="whiteAlpha.400" />

            {/* Section V */}
            <SectionHeading>V. Qualification & Progression</SectionHeading>

            <UnorderedList spacing={3} pl={4}>
                <ListItem>
                    <Text as="span" fontWeight="bold">Kids Singles (Boys):</Text> 4 Groups. Only the{' '}
                    <Text as="span" fontWeight="bold" color="jazzy.neon">Winner (Rank 1)</Text> of each group advances to Semi-Finals.
                </ListItem>
                <ListItem>
                    <Text as="span" fontWeight="bold">Kids Singles (Girls) & Adult Singles:</Text> 2 Groups.{' '}
                    <Text as="span" fontWeight="bold" color="jazzy.neon">Top 2</Text> from each group advance to Semi-Finals.
                </ListItem>
                <ListItem>
                    <Text as="span" fontWeight="bold">All Doubles Categories:</Text> Round Robin Pool.{' '}
                    <Text as="span" fontWeight="bold" color="jazzy.neon">Top 2 teams</Text> in the final points table qualify directly for the Grand Final.
                </ListItem>
            </UnorderedList>

            <Divider my={8} borderColor="whiteAlpha.400" />

            {/* Section VI */}
            <SectionHeading>VI. 🍌 Refreshments & Nutrition</SectionHeading>

            <UnorderedList spacing={3} pl={4}>
                <ListItem>
                    <Text as="span" fontWeight="bold">Provided by Association:</Text> Bananas and Glucose will be available at the courtside for all participants for quick energy and hydration.
                </ListItem>
                <ListItem>
                    <Text as="span" fontWeight="bold">Individual Responsibility:</Text> Any additional specific refreshments, sports drinks, or meals must be brought by the individuals.
                </ListItem>
            </UnorderedList>

            <Divider my={8} borderColor="whiteAlpha.400" />

            {/* Section VII */}
            <SectionHeading>VII. Player Conduct & Punctuality</SectionHeading>

            <OrderedList spacing={3} pl={4}>
                <ListItem>
                    <Text as="span" fontWeight="bold">Reporting:</Text> Players must report to their assigned court{' '}
                    <Text as="span" fontWeight="bold" color="jazzy.neon">5 minutes prior</Text> to the scheduled slot.
                </ListItem>
                <ListItem>
                    <Text as="span" fontWeight="bold">Walkover:</Text> A 5-minute grace period is allowed. Beyond that, the absent player forfeits the match.
                </ListItem>
                <ListItem>
                    <Text as="span" fontWeight="bold">Umpiring:</Text> Umpire decisions on "In/Out" calls are final. No arguments will be entertained to maintain the spirit of the game.
                </ListItem>
            </OrderedList>

            <Divider my={8} borderColor="whiteAlpha.400" />

            {/* Footer */}
            <Box textAlign="center" mt={8} py={4} borderTop="1px solid" borderColor="whiteAlpha.200">
                <Text fontWeight="bold" color="jazzy.neon">Tournament Committee</Text>
                <Text fontSize="sm" color="gray.400" fontStyle="italic">
                    Vijayasri Eldorado Apartment Badminton Committee
                </Text>
            </Box>
        </Box>
    );
};

export default Rules;