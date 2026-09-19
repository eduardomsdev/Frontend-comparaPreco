import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ErrorState, LoadingState, Screen } from '../../components/ui';
import { EmptyState } from '../../components/ui/EmptyState';
import { useNearbyEstablishments, type NearbyEstablishment } from '../../hooks/useNearbyEstablishments';
import { friendlyMessage } from '../../services/api/errors';
import { colors, radius, spacing, typography } from '../../theme';
import { formatDistance } from '../../utils/geo';
import { ESTABLISHMENT_TYPE_LABELS } from '../../utils/labels';
import type { EstablishmentResponse } from '../../schemas/api';

export function NearbyEstablishmentsScreen() {
  const { status, nearby, withoutLocation, error, refetch } = useNearbyEstablishments();

  if (status === 'loading') {
    return <LoadingState label="Buscando sua localização…" />;
  }

  if (status === 'permission-denied') {
    return (
      <EmptyState
        icon="📍"
        title="Permissão de localização necessária"
        message="Para ver os estabelecimentos mais próximos de você, precisamos acessar sua localização."
        actionLabel="Tentar novamente"
        onAction={refetch}
      />
    );
  }

  if (status === 'error') {
    return (
      <ErrorState
        message={error ? friendlyMessage(error) : 'Não foi possível obter sua localização.'}
        onRetry={refetch}
      />
    );
  }

  if (status === 'empty') {
    return <EmptyState icon="🏬" title="Nenhum estabelecimento cadastrado" message="Ainda não há estabelecimentos no PreçoCerto." />;
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Estabelecimentos próximos</Text>
        <Text style={styles.subtitle}>Ordenados pela distância até você</Text>
      </View>

      <FlatList
        data={nearby}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => <EstablishmentRow establishment={item} />}
        ListEmptyComponent={
          <Text style={styles.noneWithLocation}>Nenhum estabelecimento com localização cadastrada ainda.</Text>
        }
        ListFooterComponent={
          withoutLocation.length > 0 ? (
            <View style={styles.withoutLocationSection}>
              <Text style={styles.sectionLabel}>Sem localização cadastrada</Text>
              {withoutLocation.map((establishment) => (
                <View key={establishment.id} style={styles.row}>
                  <View style={styles.rowInfo}>
                    <Text style={styles.name}>{establishment.name}</Text>
                    <Text style={styles.meta}>
                      {establishment.city}/{establishment.state} · {ESTABLISHMENT_TYPE_LABELS[establishment.type]}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null
        }
      />
    </Screen>
  );
}

function EstablishmentRow({ establishment }: { establishment: NearbyEstablishment | EstablishmentResponse }) {
  const distance = 'distanceKm' in establishment ? formatDistance(establishment.distanceKm) : null;

  return (
    <View style={styles.row}>
      <View style={styles.rowInfo}>
        <Text style={styles.name}>{establishment.name}</Text>
        <Text style={styles.meta}>
          {establishment.city}/{establishment.state} · {ESTABLISHMENT_TYPE_LABELS[establishment.type]}
        </Text>
      </View>
      {distance ? <Text style={styles.distance}>{distance}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 2,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  distance: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  noneWithLocation: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  withoutLocationSection: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.overline,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
});
