import { Box, Text, Spinner, VStack } from "@chakra-ui/react";

export const LoadingSpinner = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" py={8}>
      <VStack>
        <Spinner size="xl" color="blue.500" />
        <Text>読み込み中...</Text>
      </VStack>
    </Box>
  );
};
