import React, { useCallback, useEffect } from 'react';
import { View, Button, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useSSO } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

// Resolver sessões pendentes
// Comentário: chama `maybeCompleteAuthSession` para completar qualquer
// fluxo de autenticação pendente iniciado por `AuthSession`/WebBrowser.
// Isso é importante para garantir que o app processe o redirecionamento
// de volta (deep link) quando o navegador retornar ao app.
WebBrowser.maybeCompleteAuthSession();

// Pré-aquece o navegador no Android e garante que o módulo esteja pronto


export default function GoogleSignIn() {
  const router = useRouter();
  const { startSSOFlow } = useSSO();

  useEffect(() => {
    // Pré-aquece o navegador no Android
    // Comentário: em alguns dispositivos Android o módulo que abre o
    // navegador precisa ser 'pré-aquecido' com `warmUpAsync()` para
    // garantir que a primeira chamada abra a tela de login. Cold-starts
    // podem falhar ou atrasar a abertura do browser — o hot reload
    // durante o desenvolvimento acabava executando essa inicialização
    // novamente, por isso o comportamento vinha só após salvar o arquivo.
    if (Platform.OS === 'android') {
      void WebBrowser.warmUpAsync();
      // pequeno delay opcional para garantir warmup
      const t = setTimeout(() => {}, 50);
      return () => {
        clearTimeout(t);
        // limpa o recurso quando o componente desmonta
        void WebBrowser.coolDownAsync();
      };
    }
    return undefined;
  }, []);

  // Função que dispara o login
  const handleGoogleSignIn = useCallback(async () => {
    // Comentário: log para confirmar que o botão foi acionado
    console.log('GoogleSignIn: handler chamado');
    try {
      // Gera o redirect URI correto para Expo
      // Comentário: `makeRedirectUri` constrói a URI que o provedor OAuth
      // deve usar para devolver o usuário ao app. Em Expo Go normalmente
      // se usa `useProxy: true`; em builds standalone/prod pode-se usar o
      // scheme definido em `app.json`.
      const redirectUrl = AuthSession.makeRedirectUri({
        useProxy: true, // Necessário para apps Expo Go
      } as any);

      // Inicia o fluxo SSO com Clerk
      // Comentário: `startSSOFlow` abre o fluxo OAuth (via browser). Ele
      // retorna `createdSessionId` quando a autenticação terminou e uma
      // função `setActive` para ativar a sessão localmente.
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl,
      });

      // Se criou sessão, ativa e navega
      // Comentário: `setActive` é usado para aplicar a sessão retornada
      // pelo Clerk e permite que a aplicação trate a navegação pós-login.
      if (createdSessionId && setActive) {
        await setActive({
          session: createdSessionId,
          navigate: async () => {
            // Navega para HomeScreen após login
            router.push('/HomeScreen');
          },
        });
      }
    } catch (error) {
      // Comentário: log de erro para inspecionar falhas no fluxo OAuth
      console.error('Erro ao logar com Google:', error);
    }
  }, [router, startSSOFlow]);

  return (
    <View style={{ marginVertical: 10 }}>
      {/* Comentário: o Button chama o handler que inicia o fluxo OAuth */}
      <Button title="Entrar com conta Google" onPress={handleGoogleSignIn} />
    </View>
  );
}
