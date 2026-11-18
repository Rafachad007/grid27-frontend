import { Image, Pressable, StyleSheet, Text } from 'react-native';

type CardProps = {
  title: string;
  image: string;
  description: string;
  onPress: () => void;
};

export default function Card({
  title,
  image,
  description,
  onPress,
}: CardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
  title: {
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    padding: 12,
    color: '#555',
  },
});
