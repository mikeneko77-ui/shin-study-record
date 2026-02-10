import { Box, Text } from "@chakra-ui/react";
import { formatTime, type Record } from "../domain/record";

type TotalTimeProps = {
  records: Record[];
};

export const TotalTime = ({ records }: TotalTimeProps) => {
  const total = records.reduce((sum, record) => sum + record.time, 0);

  return (
    <Box textAlign="center" py={4}>
      <Text fontSize="xl" fontWeight="bold">
        合計学習時間: {formatTime(total)}
      </Text>
    </Box>
  );
};
