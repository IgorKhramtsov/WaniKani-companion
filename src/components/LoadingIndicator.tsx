import { ActivityIndicator, View } from "react-native";
import { Barrier } from "./Barrier";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  loading: boolean;
}>

export const LoadingIndicator = ({ children, loading }: Props) => {
  return (
    <View>
      {loading &&
        <Barrier>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </Barrier>
      }
      {children}
    </View>
  );
};
