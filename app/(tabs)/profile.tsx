// Dans la section du rendu de l'image de profil
{user.profile_image ? (
  <Image 
    source={{ uri: user.profile_image.startsWith('data:') 
      ? user.profile_image 
      : `data:image/jpeg;base64,${user.profile_image}` 
    }}
    style={styles.profileImage}
  />
) : (
  <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
    <Text style={styles.profileImagePlaceholderText}>
      {user.first_name?.charAt(0) || user.email.charAt(0)}
    </Text>
  </View>
)}